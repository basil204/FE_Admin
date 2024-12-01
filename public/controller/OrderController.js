app.controller("OrderController", function ($scope, $http, socket) {
  const token = localStorage.getItem("authToken");

  // Định nghĩa URL gốc của API
  const baseUrl = "http://160.30.21.47:1234/api";

  // List of possible order statuses
  $scope.availableStatuses = [
    { code: 301, name: 'Chờ Duyệt Đơn' },
    { code: 333, name: 'Giỏ hàng' },
    { code: 334, name: 'Chờ xử lý' },
    { code: 335, name: 'Chờ thanh toán' },
    { code: 336, name: 'Hủy' },
    { code: 337, name: 'Hoàn tiền' },
    { code: 338, name: 'Hoàn thành' },
    { code: 900, name: 'Đơn mới' },
    { code: 901, name: 'Chờ lấy hàng' },
    { code: 902, name: 'Lấy hàng' },
    { code: 903, name: 'Đã lấy' },
    { code: 904, name: 'Giao hàng' },
    { code: 905, name: 'Giao hàng thành công' },
    { code: 906, name: 'Giao hàng thất bại' },
    { code: 907, name: 'Trả lại hàng hóa' },
    { code: 908, name: 'Chuyển hoàn' },
    { code: 909, name: 'Đã đối soát' },
    { code: 910, name: 'Đã đối soát khách' },
    { code: 911, name: 'COD trả cho khách' },
    { code: 912, name: 'Chờ thanh toán COD' },
    { code: 913, name: 'Hoàn thành' },
    { code: 914, name: 'Đơn hủy' },
    { code: 915, name: 'Giao hàng trễ' },
    { code: 916, name: 'Giao hàng 1 phần' },
    { code: 1000, name: 'Lỗi đơn hàng' }
  ];

  // Function to show notifications
  $scope.showNotification = function (message, type) {
    Swal.fire({
      title: type === "success" ? "Thành công!" : "Lỗi!",
      text: message,
      icon: type,
      confirmButtonText: "OK",
      timer: 3000,
      timerProgressBar: true,
    });
  };

  // Kiểm tra nếu token tồn tại
  if (token) {
    // Gửi yêu cầu GET đến API để lấy danh sách hóa đơn
    $http({
      method: "GET",
      url: `${baseUrl}/Invoice/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        // Lọc các hóa đơn có status khác 334 và 336
        $scope.invoices = response.data.filter(function (invoice) {
          return invoice.status !== 336;
        });
      },
      function (error) {
        console.error("Có lỗi khi lấy dữ liệu:", error);
        $scope.showNotification("Có lỗi khi tải danh sách hóa đơn. Vui lòng thử lại!", "error");
      }
    );
  } else {
    console.error("Không tìm thấy token xác thực.");
  }

  // Hàm cập nhật trạng thái hóa đơn
  $scope.updateInvoiceStatus = function (invoice) {
    const updatedStatus = { status: invoice.status };

    // Gửi yêu cầu PUT để cập nhật trạng thái hóa đơn
    $http({
      method: "PUT",
      url: `${baseUrl}/Invoice/update/${invoice.id}`,
      data: updatedStatus,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(function (response) {
      console.log("Cập nhật trạng thái hóa đơn thành công:", response);

      // Show success notification
      $scope.showNotification("Cập nhật trạng thái hóa đơn thành công!", "success");

      // Reload invoices list after update
      $scope.loadInvoices();
    }, function (error) {
      console.error("Có lỗi khi cập nhật trạng thái hóa đơn:", error);

      // Show error notification
      $scope.showNotification("Có lỗi khi cập nhật trạng thái hóa đơn. Vui lòng thử lại!", "error");
    });
  };

  // Hàm cập nhật hóa đơn
  $scope.updateInvoice = function () {
    const updatedInvoice = {
      phonenumber: $scope.phoneNumber,
      deliveryaddress: $scope.deliveryAddress,
    };

    // Gửi yêu cầu PUT để cập nhật hóa đơn
    $http({
      method: "PUT",
      url: `${baseUrl}/Invoice/update/${$scope.id}`, // Sử dụng 'id' thay vì 'invoiceCode'
      data: updatedInvoice,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(function (response) {
      console.log("Cập nhật hóa đơn thành công:", response);
      $scope.showNotification("Cập nhật hóa đơn thành công!", "success");
      $('#ModalUP').modal('hide');

      // Reload invoices list after update
      $scope.loadInvoices();
    }, function (error) {
      console.error("Có lỗi khi cập nhật hóa đơn:", error);
      $scope.showNotification("Có lỗi khi cập nhật hóa đơn. Vui lòng thử lại!", "error");
    });
  };

  // Hàm lấy chi tiết hóa đơn khi nhấn "Sửa"
  $scope.getInvoiceDetailById = function (invoiceId) {
    $http({
      method: "GET",
      url: `${baseUrl}/Invoicedetail/${invoiceId}/details`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.invoiceDetails = response.data;
        console.log("Chi tiết hóa đơn:", $scope.invoiceDetails);

        if ($scope.invoiceDetails && $scope.invoiceDetails.length > 0) {
          const invoiceDetail = $scope.invoiceDetails[0];

          // Set invoice details in the modal form
          $scope.invoiceCode = invoiceDetail.invoiceCode;
          $scope.id = invoiceDetail.id;
          $scope.deliveryAddress = invoiceDetail.deliveryAddress;
          $scope.phoneNumber = invoiceDetail.phoneNumber;

          // Process the list of items
          $scope.items = invoiceDetail.items.map((item) => {
            return {
              milkTasteName: item.milkTasteName,
              milkDetailDescription: item.milkDetailDescription,
              quantity: item.quantity,
              totalAmount: item.totalAmount,
              unit: item.unit,
              capacity: item.capacity,
            };
          });
        } else {
          console.error("Không tìm thấy dữ liệu chi tiết hóa đơn.");
          $scope.showNotification("Không tìm thấy chi tiết hóa đơn.", "error");
        }
      },
      function (error) {
        console.error("Có lỗi khi lấy chi tiết hóa đơn:", error);
        $scope.showNotification("Có lỗi khi lấy chi tiết hóa đơn. Vui lòng thử lại!", "error");
      }
    );
  };
  $scope.checkZalo = function (phoneNumber) {
    const apiUrl = `http://160.30.21.47:3030/api/customerinfo?phone=${phoneNumber}`;

    // Gửi yêu cầu GET để kiểm tra số điện thoại trên Zalo
    $http({
      method: "GET",
      url: apiUrl,
    }).then(function (response) {
      // Kiểm tra mã trạng thái trả về và thông báo
      if (response.status === 200) {
        // Assuming the response contains a field 'zalo_name' when phone is found
        const zaloName = response.data.user.zalo_name;
        console.log("Zalo name:", response);

        if (zaloName) {
          $scope.showNotification(`Số điện thoại tồn tại trên Zalo! \n Tên Zalo: ${zaloName}`, "success");

        } else {
          $scope.showNotification("Số điện thoại tồn tại trên Zalo, nhưng không có tên Zalo.", "warning");
        }
      } else if (response.status === 404) {
        $scope.showNotification("Số điện thoại không tồn tại trên Zalo.", "error");
      } else {
        $scope.showNotification("Số điện thoại không hợp lệ hoặc có lỗi xảy ra.", "error");
      }
    }, function (error) {
      console.error("Có lỗi khi kiểm tra Zalo:", error);
      $scope.showNotification("Có lỗi khi kiểm tra số điện thoại Zalo. Vui lòng thử lại!", "error");
    });
  };

  // Hàm tải lại danh sách hóa đơn
  $scope.loadInvoices = function () {
    // Gửi yêu cầu GET lại để lấy danh sách hóa đơn
    $http({
      method: "GET",
      url: `${baseUrl}/Invoice/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        // Lọc các hóa đơn có status khác 334 và 336
        $scope.invoices = response.data.filter(function (invoice) {
          return invoice.status !== 336;
        });
      },
      function (error) {
        console.error("Có lỗi khi tải lại danh sách hóa đơn:", error);
        $scope.showNotification("Có lỗi khi tải lại danh sách hóa đơn. Vui lòng thử lại!", "error");
      }
    );
  };
});
