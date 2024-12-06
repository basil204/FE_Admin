app.controller("OrderController", function ($scope, $http) {
  const token = localStorage.getItem("authToken");

  // Define base URL for API
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
    { code: 914, name: 'Đơn hủy' },
    { code: 915, name: 'Giao hàng trễ' },
    { code: 916, name: 'Giao hàng 1 phần' },
    { code: 1000, name: 'Lỗi đơn hàng' }
  ];

  // Define a function to filter available statuses based on current order status
  // Filter available statuses based on the current status of the invoice
  // Filter available statuses based on the current status of the invoice
  $scope.filterAvailableStatuses = function (currentStatusCode) {
    const hiddenStatuses = [336,905, 906, 907, 908, 909, 910, 911, 912, 914, 915, 916, 1000]; // Trạng thái cần ẩn

    // Nếu trạng thái hiện tại nằm trong nhóm cần ẩn, chỉ hiển thị trạng thái hiện tại
    if (hiddenStatuses.includes(currentStatusCode)) {
      // Chỉ trả về trạng thái hiện tại, không cho phép thay đổi
      return $scope.availableStatuses.filter(status => status.code === currentStatusCode);
    }

    // Nếu không, hiển thị các trạng thái từ trạng thái hiện tại trở lên
    return $scope.availableStatuses.filter(status => status.code >= currentStatusCode);
  };


  // Example usage of filter in updating an invoice status
  $scope.updateInvoiceStatus = function (invoice) {
    // Get available statuses based on the current invoice status
    const filteredStatuses = $scope.filterAvailableStatuses(invoice.status);
    console.log("Filtered available statuses: ", filteredStatuses);

    // Here, you can use filteredStatuses for updating or displaying valid options for the invoice status.
    // For example, if you are updating the invoice status:
    $http({
      method: "PUT",
      url: `${baseUrl}/Invoice/update/${invoice.id}`,
      headers: { Authorization: `Bearer ${token}` },
      data: { status: invoice.status }
    }).then(function () {
      $scope.showNotification("Cập nhật trạng thái đơn hàng thành công!", "success");
    }, function (error) {
      $scope.showNotification("Cập nhật trạng thái đơn hàng thất bại!", "error");
    });
  };

  // Optionally, you can filter available statuses when retrieving an invoice or performing any other actions
  $scope.getFilteredStatusesForInvoice = function (invoiceId) {
    // Fetch the invoice details and filter statuses based on the current status
    $http({
      method: "GET",
      url: `${baseUrl}/Invoicedetail/${invoiceId}/details`,
      headers: { Authorization: `Bearer ${token}` }
    }).then(function (response) {
      const invoiceDetail = response.data[0];
      const currentStatusCode = invoiceDetail.status;

      // Get available statuses based on the current status
      const availableStatuses = $scope.filterAvailableStatuses(currentStatusCode);
      console.log("Available statuses: ", availableStatuses);
      // Use availableStatuses for UI or other logic as needed
    }, function (error) {
      console.error("Error fetching invoice details:", error);
    });
  };

  // Show notification
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

  $scope.currentPage = 0;
  $scope.pageSize = 10;
  function formatDate(date) {
    const d = new Date(date); // Convert to Date object
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2); // Add leading 0 for months < 10
    const day = ('0' + d.getDate()).slice(-2); // Add leading 0 for days < 10
    const hours = ('0' + d.getHours()).slice(-2); // Add leading 0 for hours < 10
    const minutes = ('0' + d.getMinutes()).slice(-2); // Add leading 0 for minutes < 10
    const seconds = ('0' + d.getSeconds()).slice(-2); // Add leading 0 for seconds < 10

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
  $scope.searchInvoices = function() {
    // Check if both start and end dates are selected properly
    if ($scope.search.startDate && !$scope.search.endDate) {
      $scope.showNotification("Bạn phải chọn cả ngày bắt đầu và ngày kết thúc", "error");
      return;
    }
    if (!$scope.search.startDate && $scope.search.endDate) {
      $scope.showNotification("Bạn phải chọn cả ngày bắt đầu và ngày kết thúc", "error");
      return;
    }

    let queryParams = [];

    // Collect filters from search model
    if ($scope.search.invoiceCode) {
      queryParams.push(`invoiceCode=${$scope.search.invoiceCode}`);
    }
    if ($scope.search.phonenumber) {
      queryParams.push(`phonenumber=${$scope.search.phonenumber}`);
    }
    if ($scope.search.deliveryAddress) {
      queryParams.push(`deliveryAddress=${$scope.search.deliveryAddress}`);
    }
    if ($scope.search.paymentMethod) {
      queryParams.push(`paymentmethod=${$scope.search.paymentMethod}`);
    }

    if ($scope.search.startDate) {
      queryParams.push(`startDate=${formatDate($scope.search.startDate)}`);
    }
    if ($scope.search.endDate) {
      queryParams.push(`endDate=${formatDate($scope.search.endDate)}`);
    }
    if ($scope.search.status) {
      queryParams.push(`status=${$scope.search.status}`);
    }

    let queryString = queryParams.join("&");

    // Send the GET request with the query string parameters
    $http({
      method: "GET",
      url: `${baseUrl}/Invoice/search?${queryString}&page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then(function (response) {
      const data = response.data;
      if (data && data.content) {
        // Map the response data to the invoices array
        $scope.invoices = data.content.map(invoice => ({
          id: invoice[0],
          invoiceCode: invoice[1],
          creationDate: invoice[2],
          deliveryAddress: invoice[5],
          discountAmount: invoice[6],
          totalAmount: invoice[4],
          paymentMethod: invoice[7],
          status: invoice[8],
          phoneNumber: invoice[9]
        }));
        $scope.pageInfo = data.page;
      }
    }, function (error) {
      console.error("Error fetching invoices:", error);
      $scope.showNotification("Có lỗi khi tìm kiếm hóa đơn. Vui lòng thử lại!", "error");
    });
  };

// Available payment methods for the dropdown
  $scope.availablePaymentMethods = [
    { code: 'NetBanking', name: 'NetBanking' },
    { code: 'COD', name: 'COD' },
  ];



  // Fetch invoices with pagination
  $scope.getInvoices = function () {
    $http({
      method: "GET",
      url: `${baseUrl}/Invoice/search?page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then(function (response) {
      const data = response.data;
      if (data && data.content) {
        // Initialize an empty array for invoices
        $scope.invoices = [];

        // Loop through all content items
        for (let i = 0; i < data.content.length; i++) {
          const invoice = data.content[i];

          // Push each invoice into $scope.invoices
          $scope.invoices.push({
            id: invoice[0],                  // Invoice ID
            invoiceCode: invoice[1],          // Invoice Code
            creationDate: invoice[2],         // Creation Date
            deliveryAddress: invoice[5],      // Delivery Address
            discountAmount: invoice[6],       // Discount Amount
            totalAmount: invoice[4],          // Total Amount
            paymentMethod: invoice[7],        // Payment Method
            status: invoice[8] , // Status
            phoneNumber : invoice[9]        // Phone Number
          });
        }

        // Set page information for pagination
        $scope.pageInfo = data.page;

        // Log invoice codes
        console.log("Danh sách hóa đơn:");
        $scope.invoices.forEach(function(invoice) {
          console.log(invoice.invoiceCode);
        });
      }
    }, function (error) {
      console.error("Error fetching invoices:", error);
    });
  };


  // Handle pagination controls
  $scope.nextPage = function () {
    if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
      $scope.currentPage++;
      // Check if searchInvoices is being used, otherwise call getInvoices
      if ($scope.search && ($scope.search.invoiceCode || $scope.search.phoneNumber|| $scope.search.deliveryAddress|| $scope.search.paymentMethod || $scope.search.startDate || $scope.search.endDate || $scope.search.status)) {
        $scope.searchInvoices();
      } else {
        $scope.getInvoices();
      }
    }
  };

  $scope.previousPage = function () {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
      // Check if searchInvoices is being used, otherwise call getInvoices
      if ($scope.search && ($scope.search.invoiceCode || $scope.search.phoneNumber|| $scope.search.deliveryAddress|| $scope.search.paymentMethod || $scope.search.startDate || $scope.search.endDate || $scope.search.status)) {
        $scope.searchInvoices();
      } else {
        $scope.getInvoices();
      }
    }
  };

  $scope.goToFirstPage = function () {
    $scope.currentPage = 0;
    // Check if searchInvoices is being used, otherwise call getInvoices
    if ($scope.search && ($scope.search.invoiceCode || $scope.search.phoneNumber|| $scope.search.deliveryAddress|| $scope.search.paymentMethod || $scope.search.startDate || $scope.search.endDate || $scope.search.status)) {
      $scope.searchInvoices();
    } else {
      $scope.getInvoices();
    }
  };

  $scope.goToLastPage = function () {
    $scope.currentPage = $scope.pageInfo.totalPages - 1;
    // Check if searchInvoices is being used, otherwise call getInvoices
    if ($scope.search && ($scope.search.invoiceCode || $scope.search.phoneNumber|| $scope.search.deliveryAddress|| $scope.search.paymentMethod || $scope.search.startDate || $scope.search.endDate || $scope.search.status)) {
      $scope.searchInvoices();
    } else {
      $scope.getInvoices();
    }
  };


  // Fetch invoice details by ID
  $scope.getInvoiceDetailById = function (invoiceId) {
    $http({
      method: "GET",
      url: `${baseUrl}/Invoicedetail/${invoiceId}/details`,
      headers: { Authorization: `Bearer ${token}` },
    }).then(function (response) {
      $scope.invoiceDetails = response.data;
      if ($scope.invoiceDetails && $scope.invoiceDetails.length > 0) {
        const invoiceDetail = $scope.invoiceDetails[0];
        $scope.invoiceCode = invoiceDetail.invoiceCode;
        $scope.id = invoiceDetail.id;
        $scope.deliveryAddress = invoiceDetail.deliveryAddress;
        $scope.phoneNumber = invoiceDetail.phoneNumber;
        $scope.items = invoiceDetail.items.map(item => ({
          milkTasteName: item.milkTasteName,
          milkDetailDescription: item.milkDetailDescription,
          quantity: item.quantity,
          totalAmount: item.totalAmount,
          unit: item.unit,
          capacity: item.capacity
        }));
      }
    }, function (error) {
      console.error("Error fetching invoice details:", error);
    });
  };

  // Update invoice status
  $scope.updateInvoiceStatus = function (invoice) {
    $http({
      method: "PUT",
      url: `${baseUrl}/Invoice/update/${invoice.id}`,
      headers: { Authorization: `Bearer ${token}` },
      data: { status: invoice.status }
    }).then(function () {
      $scope.showNotification("Cập nhật trạng thái đơn hàng thành công!", "success");
    }, function (error) {
      $scope.showNotification("Cập nhật trạng thái đơn hàng thất bại!", "error");
    });
  };

  // Show notification
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

  // Initialize invoices
  $scope.getInvoices();


// Update invoice details
  $scope.updateInvoice = function () {
    const updatedInvoice = {
      phonenumber: $scope.phoneNumber,
      deliveryaddress: $scope.deliveryAddress,
    };

    $http({
      method: "PUT",
      url: `${baseUrl}/Invoice/update/${$scope.id}`, // Using 'id' instead of 'invoiceCode'
      data: updatedInvoice,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(function (response) {
      console.log("Cập nhật hóa đơn thành công:", response);
      $scope.showNotification("Cập nhật hóa đơn thành công!", "success");
      $('#ModalUP').modal('hide');
      $scope.loadInvoices();
    }, function (error) {
      console.error("Có lỗi khi cập nhật hóa đơn:", error);
      $scope.showNotification("Có lỗi khi cập nhật hóa đơn. Vui lòng thử lại!", "error");
    });
  };

  // Fetch invoice details by ID
  $scope.getInvoiceDetailById = function (invoiceId) {
    $http({
      method: "GET",
      url: `${baseUrl}/Invoicedetail/${invoiceId}/details`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(function (response) {
      $scope.invoiceDetails = response.data;
      console.log("Chi tiết hóa đơn:", $scope.invoiceDetails);

      if ($scope.invoiceDetails && $scope.invoiceDetails.length > 0) {
        const invoiceDetail = $scope.invoiceDetails[0];

        $scope.invoiceCode = invoiceDetail.invoiceCode;
        $scope.id = invoiceDetail.id;
        $scope.deliveryAddress = invoiceDetail.deliveryAddress;
        $scope.phoneNumber = invoiceDetail.phoneNumber;

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
    }, function (error) {
      console.error("Có lỗi khi lấy chi tiết hóa đơn:", error);
      $scope.showNotification("Có lỗi khi lấy chi tiết hóa đơn. Vui lòng thử lại!", "error");
    });
  };

  // Check Zalo account by phone number
  $scope.checkZalo = function (phoneNumber) {
    const apiUrl = `http://160.30.21.47:3030/api/customerinfo?phone=${phoneNumber}`;

    $http({
      method: "GET",
      url: apiUrl,
    }).then(function (response) {
      if (response.status === 200) {
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
});