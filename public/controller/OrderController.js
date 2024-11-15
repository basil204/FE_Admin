app.controller("OrderController", function ($scope, $http) {
  const token = localStorage.getItem("authToken");

  // Kiểm tra nếu token tồn tại
  if (token) {
    // Gửi yêu cầu GET đến API để lấy danh sách hóa đơn
    $http({
      method: "GET",
      url: "http://160.30.21.47:1234/api/Invoice/lst",
      headers: {
        Authorization: `Bearer ${token}`, // Gửi token trong header
      },
    }).then(
      function (response) {
        // Lọc các hóa đơn có status khác 334 và 336
        $scope.invoices = response.data.filter(function (invoice) {
          return invoice.status !== 334 && invoice.status !== 336;
        });

        console.log(
          "Danh sách hóa đơn (không bao gồm trạng thái 334 và 336):",
          $scope.invoices
        );
      },
      function (error) {
        console.error("Có lỗi khi lấy dữ liệu:", error);
      }
    );
  } else {
    console.error("Không tìm thấy token xác thực.");
  }

  // Hàm lấy chi tiết hóa đơn khi nhấn "Sửa"
  $scope.getInvoiceDetailById = function (invoiceId) {
    $http({
      method: "GET",
      url: `http://160.30.21.47:1234/api/Invoicedetail/${invoiceId}/details`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        // Lưu thông tin chi tiết hóa đơn vào $scope
        $scope.invoiceDetails = response.data;

        // Kiểm tra nếu response.data có ít nhất một phần tử
        if ($scope.invoiceDetails && $scope.invoiceDetails.length > 0) {
          // Cập nhật modal với dữ liệu từ API (lấy phần tử đầu tiên)
          $scope.invoiceCode = $scope.invoiceDetails[0].invoiceCode;
          $scope.deliveryAddress = $scope.invoiceDetails[0].deliveryAddress;
          $scope.phoneNumber = $scope.invoiceDetails[0].phoneNumber;

          // Lặp qua các sản phẩm trong items và cập nhật thông tin
          $scope.items = $scope.invoiceDetails[0].items.map((item) => {
            return {
              milkTasteName: item.milkTasteName,
              milkDetailDescription: item.milkDetailDescription,
              quantity: item.quantity,
              totalAmount: item.totalAmount,
              unit: item.unit,
              capacity: item.capacity,
            };
          });

          console.log("Chi tiết hóa đơn:", $scope.items); // In ra các sản phẩm của hóa đơn
        } else {
          console.error("Không tìm thấy dữ liệu chi tiết hóa đơn.");
        }
      },
      function (error) {
        console.error("Có lỗi khi lấy chi tiết hóa đơn:", error);
      }
    );
  };

  // Hàm cập nhật thông tin hóa đơn
  $scope.updateInvoice = function () {
    // Gửi yêu cầu PUT để cập nhật thông tin hóa đơn
    $http({
      method: "PUT",
      url: `http://160.30.21.47:1234/api/Invoice/${$scope.invoiceCode}`,
      data: {
        deliveryAddress: $scope.deliveryAddress,
        phoneNumber: $scope.phoneNumber,
        items: $scope.items,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        console.log("Cập nhật thành công:", response);
      },
      function (error) {
        console.error("Có lỗi khi cập nhật hóa đơn:", error);
      }
    );
  };
});
