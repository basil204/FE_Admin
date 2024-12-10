app.controller("OrderController", function ($scope, $http) {
  const token = localStorage.getItem("authToken");

  // Define base URL for API
  const baseUrl = "http://160.30.21.47:1234/api";
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Increase quantity
  // Decrease quantity

  $scope.decreaseQuantity = function (item) {
    if (item.quantity > 0) {
      // Check the current stock before decreasing
      $http
        .get(
          `http://160.30.21.47:1234/api/Milkdetail/checkcount/${item.milkdetailid
          }?quantity=${item.quantity - 1}`,
          config
        )
        .then(function (response) {
          if (response.status === 200) {
            // If the stock check is successful and the quantity can be decreased
            item.quantity--;
            $scope.updateTotalAmount(item); // Recalculate total after quantity change
          }
        })
        .catch(function (error) {
          if (error.status === 400) {
            // Show a custom notification when stock is insufficient
            $scope.showNotification(
              `Số lượng không đủ trong kho! Hiện tại kho chỉ còn ${error.data.currentStock} sản phẩm.`,
              "error"
            );
            item.quantity = error.data.currentStock;
          } else {
            console.error("Error checking stock:", error);
          }
        });
    } else {
      alert("Số lượng không thể nhỏ hơn 0!"); // Notify when quantity is already 0
    }
  };

  // Increase quantity
  $scope.increaseQuantity = function (item) {
    let currentQuantity = item.quantity;
    $http
      .get(
        `http://160.30.21.47:1234/api/Milkdetail/checkcount/${item.milkdetailid
        }?quantity=${currentQuantity + 1}`,
        config
      )
      .then(function (response) {
        if (response.status === 200) {
          if (response.data.currentStock >= currentQuantity + 1) {
            item.quantity++;
          } else {
            item.quantity = 1;
            $scope.showNotification(
              `Kho không đủ. Số lượng đã được đặt lại về 1.`,
              "warning"
            );
          }
          $scope.updateTotalAmount(item); // Recalculate total after quantity change
        }
      })
      .catch(function (error) {
        if (error.status === 400) {
          $scope.showNotification(
            `Số lượng không đủ trong kho! Hiện tại kho chỉ còn ${error.data.currentStock} sản phẩm.`,
            "error"
          );
          item.quantity = error.data.currentStock;
        } else {
          console.error("Error checking stock:", error);
        }
      });
  };

  $scope.checkStockQuantity = function (item) {
    const apiUrl = `http://160.30.21.47:1234/api/Milkdetail/checkcount/${item.milkdetailid}?quantity=${item.quantity}`;

    // Gửi yêu cầu kiểm tra số lượng từ API
    $http
      .get(apiUrl, config)
      .then(function (response) {
        // Fixed here: Added '.then()' for proper promise handling

        if (response.status === 200) {
          $scope.updateTotalAmount(item);
        } else if (response.status === 404) {
          $scope.showNotification(
            "Số lượng yêu cầu vượt quá số lượng tồn kho. Số lượng tồn kho hiện tại là: " +
            response.data.currentStock,
            "error"
          );
          item.quantity = response.data.currentStock; // Gán lại số lượng bằng tồn kho hiện tại
          $scope.updateTotalAmount(item);
        }
      })
      .catch(function (error) {
        // Added error handling for API call
        console.error("API error:", error);
        $scope.showNotification(
          "Có lỗi khi kiểm tra số lượng tồn kho",
          "error"
        );
        item.quantity = error.data.currentStock;
      });
  };

  $scope.updateTotalAmount = function (item) {
    item.totalAmount = item.quantity * item.price; // Tính lại tổng tiền (quantity * price)
  };

  // List of possible order statuses
  $scope.availableStatuses = [
    { code: 301, name: "Chờ Duyệt Đơn" },
    { code: 305, name: "Thanh toán thành công" },
    { code: 336, name: "Huỷ Đơn" },
    { code: 337, name: "Chưa Thanh Toán" },
    { code: 338, name: "Đơn Chờ" },
    { code: 901, name: "Chờ lấy hàng" },
    { code: 903, name: "Đã lấy hàng" },
    { code: 904, name: "Giao hàng" },
    { code: 913, name: "Hoàn thành" },
  ];

  $scope.calculateTotalInvoiceAmount = function () {
    let total = 0;
    // Sum up the totalAmount for each item
    $scope.items.forEach(function (item) {
      total += item.totalAmount;
    });
    return total;
  };
  // Update the total amount of the invoice

  $scope.filterAvailableStatuses = function (currentStatusCode) {
    const hiddenStatuses = [901, 903, 904, 913, 336]; // Trạng thái cần ẩn

    // Nếu trạng thái hiện tại nằm trong nhóm cần ẩn, chỉ hiển thị trạng thái hiện tại
    if (hiddenStatuses.includes(currentStatusCode)) {
      // Chỉ trả về trạng thái hiện tại, không cho phép thay đổi
      return $scope.availableStatuses.filter(
        (status) => status.code === currentStatusCode
      );
    }

    // Nếu không, hiển thị các trạng thái từ trạng thái hiện tại trở lên
    return $scope.availableStatuses.filter(
      (status) => status.code >= currentStatusCode
    );
  };

  // Example usage of filter in updating an invoice status

  // Optionally, you can filter available statuses when retrieving an invoice or performing any other actions
  $scope.getFilteredStatusesForInvoice = function (invoiceId) {
    // Fetch the invoice details and filter statuses based on the current status
    $http({
      method: "GET",
      url: `${baseUrl}/Invoicedetail/${invoiceId}/details`,
      headers: { Authorization: `Bearer ${token}` },
    }).then(
      function (response) {
        const invoiceDetail = response.data[0];
        const currentStatusCode = invoiceDetail.status;

        // Get available statuses based on the current status
        const availableStatuses =
          $scope.filterAvailableStatuses(currentStatusCode);
        console.log("Available statuses: ", availableStatuses);
        // Use availableStatuses for UI or other logic as needed
      },
      function (error) {
        console.error("Error fetching invoice details:", error);
      }
    );
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
    const month = ("0" + (d.getMonth() + 1)).slice(-2); // Add leading 0 for months < 10
    const day = ("0" + d.getDate()).slice(-2); // Add leading 0 for days < 10
    const hours = ("0" + d.getHours()).slice(-2); // Add leading 0 for hours < 10
    const minutes = ("0" + d.getMinutes()).slice(-2); // Add leading 0 for minutes < 10
    const seconds = ("0" + d.getSeconds()).slice(-2); // Add leading 0 for seconds < 10

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
  $scope.searchInvoices = function () {
    // Check if both start and end dates are selected properly
    if ($scope.search.startDate && !$scope.search.endDate) {
      $scope.showNotification(
        "Bạn phải chọn cả ngày bắt đầu và ngày kết thúc",
        "error"
      );
      return;
    }
    if (!$scope.search.startDate && $scope.search.endDate) {
      $scope.showNotification(
        "Bạn phải chọn cả ngày bắt đầu và ngày kết thúc",
        "error"
      );
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
    }).then(
      function (response) {
        const data = response.data;
        if (data && data.content) {
          // Map the response data to the invoices array
          $scope.invoices = data.content.map((invoice) => ({
            id: invoice[0],
            invoiceCode: invoice[1],
            creationDate: invoice[2],
            deliveryAddress: invoice[5],
            discountAmount: invoice[6],
            totalAmount: invoice[4],
            paymentMethod: invoice[8],
            status: invoice[9],
            phoneNumber: invoice[10],
          }));
          $scope.pageInfo = data.page;
        }
      },
      function (error) {
        console.error("Error fetching invoices:", error);
        $scope.showNotification(
          "Có lỗi khi tìm kiếm hóa đơn. Vui lòng thử lại!",
          "error"
        );
      }
    );
  };

  // Available payment methods for the dropdown
  $scope.availablePaymentMethods = [
    { code: "NetBanking", name: "NetBanking" },
    { code: "COD", name: "COD" },
  ];

  // Fetch invoices with pagination
  $scope.getInvoices = function () {
    $http({
      method: "GET",
      url: `${baseUrl}/Invoice/search?page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then(
      function (response) {
        const data = response.data;
        if (data && data.content) {
          // Initialize an empty array for invoices
          $scope.invoices = [];

          // Loop through all content items
          for (let i = 0; i < data.content.length; i++) {
            const invoice = data.content[i];

            // Push each invoice into $scope.invoices
            $scope.invoices.push({
              id: invoice[0],
              invoiceCode: invoice[1],
              creationDate: invoice[2],
              deliveryAddress: invoice[5],
              discountAmount: invoice[6],
              totalAmount: invoice[4],
              paymentMethod: invoice[8],
              status: invoice[9],
              phoneNumber: invoice[10],
            });
          }

          // Set page information for pagination
          $scope.pageInfo = data.page;

          // Log invoice codes
          console.log("Danh sách hóa đơn:");
          $scope.invoices.forEach(function (invoice) {
            console.log(invoice.invoiceCode);
          });
        }
      },
      function (error) {
        console.error("Error fetching invoices:", error);
      }
    );
  };

  // Handle pagination controls
  $scope.nextPage = function () {
    if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
      $scope.currentPage++;
      // Check if searchInvoices is being used, otherwise call getInvoices
      if (
        $scope.search &&
        ($scope.search.invoiceCode ||
          $scope.search.phoneNumber ||
          $scope.search.deliveryAddress ||
          $scope.search.paymentMethod ||
          $scope.search.startDate ||
          $scope.search.endDate ||
          $scope.search.status)
      ) {
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
      if (
        $scope.search &&
        ($scope.search.invoiceCode ||
          $scope.search.phoneNumber ||
          $scope.search.deliveryAddress ||
          $scope.search.paymentMethod ||
          $scope.search.startDate ||
          $scope.search.endDate ||
          $scope.search.status)
      ) {
        $scope.searchInvoices();
      } else {
        $scope.getInvoices();
      }
    }
  };

  $scope.goToFirstPage = function () {
    $scope.currentPage = 0;
    // Check if searchInvoices is being used, otherwise call getInvoices
    if (
      $scope.search &&
      ($scope.search.invoiceCode ||
        $scope.search.phoneNumber ||
        $scope.search.deliveryAddress ||
        $scope.search.paymentMethod ||
        $scope.search.startDate ||
        $scope.search.endDate ||
        $scope.search.status)
    ) {
      $scope.searchInvoices();
    } else {
      $scope.getInvoices();
    }
  };

  $scope.goToLastPage = function () {
    $scope.currentPage = $scope.pageInfo.totalPages - 1;
    // Check if searchInvoices is being used, otherwise call getInvoices
    if (
      $scope.search &&
      ($scope.search.invoiceCode ||
        $scope.search.phoneNumber ||
        $scope.search.deliveryAddress ||
        $scope.search.paymentMethod ||
        $scope.search.startDate ||
        $scope.search.endDate ||
        $scope.search.status)
    ) {
      $scope.searchInvoices();
    } else {
      $scope.getInvoices();
    }
  };

  // Fetch invoice details by ID

  // Update invoice status
  $scope.updateInvoiceStatus = function (invoice) {
    $http({
      method: "PUT",
      url: `${baseUrl}/Invoice/update/${invoice.id}`,
      headers: { Authorization: `Bearer ${token}` },
      data: { status: invoice.status },
    }).then(
      function () {
        $scope.showNotification(
          "Cập nhật trạng thái đơn hàng thành công!",
          "success"
        );
      },
      function (error) {
        $scope.showNotification(
          "Cập nhật trạng thái đơn hàng thất bại!",
          "error"
        );
      }
    );
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
    // Hiển thị thông báo hỏi trước khi thực hiện cập nhật
    Swal.fire({
      title: "Bạn có chắc chắn muốn cập nhật hóa đơn và số lượng này?",
      text: "Các thay đổi sẽ được lưu và không thể hoàn tác.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Có, cập nhật!",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Đảm bảo rằng chúng ta sẽ thực hiện cả hai tác vụ cùng một lúc
        const updateQuantityPromises = $scope.updateAllItemQuantities();
        const a = $scope.updateInvoiceTotalAmount($scope.id);

        // Cập nhật thông tin hóa đơn
        const updateInvoicePromise = $http({
          method: "PUT",
          url: `${baseUrl}/Invoice/update/${$scope.id}`,
          headers: { Authorization: `Bearer ${token}` },
          data: {
            deliveryaddress: $scope.deliveryAddress,
            phonenumber: $scope.phoneNumber,
            fullname: $scope.fullname,
          },
        });

        // Sử dụng Promise.all để xử lý cả hai thao tác (cập nhật số lượng và hóa đơn)
        Promise.all([updateQuantityPromises, updateInvoicePromise, a])
          .then(function (responses) {
            // Tất cả các yêu cầu thành công
            $scope.getInvoices(); // Lấy danh sách hóa đơn mới
            console.log("Invoice and item quantities updated successfully!");

            // Hiển thị thông báo thành công
            $scope.showNotification(
              "Cập nhật hóa đơn và số lượng thành công!",
              "success"
            );

            // Ẩn modal sau khi hoàn tất
            $("#ModalInvoiceUpdate").modal("hide");
          })
          .catch(function (error) {
            // Nếu có lỗi trong bất kỳ yêu cầu nào
            console.error("Error during update:", error);
            $scope.showNotification(
              "Có lỗi khi cập nhật hóa đơn hoặc số lượng!",
              "error"
            );
          });
      } else {
        // Nếu người dùng hủy bỏ, không làm gì cả
        console.log("Hành động bị hủy.");
      }
    });
  };

  $scope.updateAllItemQuantities = function () {
    const promises = [];

    if (!$scope.items || $scope.items.length === 0) {
      $scope.showNotification(
        "Chưa có thông tin hóa đơn để cập nhật số lượng.",
        "error"
      );
      return [];
    }

    // Tạo mảng các món hàng cần cập nhật số lượng
    const itemsToUpdate = $scope.items.map((item) => ({
      id: item.id, // Gán id của món hàng
      quantity: item.quantity, // Số lượng món hàng cần cập nhật
    }));

    // Cập nhật số lượng cho từng món hàng
    itemsToUpdate.forEach((item) => {
      const updatePromise = $http({
        method: "PUT",
        url: `${baseUrl}/Invoicedetail/updateCount/${item.id}`, // Sử dụng item.id
        headers: { Authorization: `Bearer ${token}` },
        data: { quantity: item.quantity },
      })
        .then(function (response) {
          console.log(`Quantity for item ID ${item.id} updated successfully!`);
        })
        .catch(function (error) {
          console.error(
            `Error updating quantity for item ID ${item.id}:`,
            error
          );
          $scope.showNotification("Có lỗi khi cập nhật số lượng!", "error");
        });

      promises.push(updatePromise);
    });

    return promises; // Trả về mảng các promise để Promise.all có thể xử lý
  };
  $scope.updateInvoiceTotalAmount = function (invoiceId) {
    const totalAmount = $scope.calculateTotalInvoiceAmount(); // Get the total amount

    // Make PUT request to update the invoice total amount
    $http({
      method: "PUT",
      url: `${baseUrl}/Invoice/updatequantity/${invoiceId}`,
      headers: { Authorization: `Bearer ${token}` },
      data: {
        totalamount: totalAmount, // Send the updated total amount
      },
    }).then(
      function (response) {
        // Successfully updated the total amount
        $scope.showNotification(
          "Cập nhật tổng tiền hóa đơn thành công!",
          "success"
        );
      },
      function (error) {
        // Handle error
        $scope.showNotification(
          "Có lỗi khi cập nhật tổng tiền hóa đơn!",
          "error"
        );
      }
    );
  };

  // Fetch invoice details by ID and load items
  $scope.getInvoiceDetailById = function (invoiceId) {
    $http({
      method: "GET",
      url: `${baseUrl}/Invoicedetail/${invoiceId}/details`,
      headers: { Authorization: `Bearer ${token}` },
    }).then(
      function (response) {
        $scope.invoiceDetails = response.data;
        if ($scope.invoiceDetails && $scope.invoiceDetails.length > 0) {
          const invoiceDetail = $scope.invoiceDetails[0];
          $scope.invoicestatus = invoiceDetail.status;
          $scope.invoiceCode = invoiceDetail.invoiceCode;
          $scope.id = invoiceDetail.id;
          $scope.deliveryAddress = invoiceDetail.deliveryAddress;
          $scope.phoneNumber = invoiceDetail.phoneNumber;
          $scope.fullname = invoiceDetail.fullname;

          console.log("invoiceDetail:", $scope.invoicestatus);

          // Lưu danh sách món hàng vào $scope.items
          $scope.items = invoiceDetail.items.map((item) => {
            return {
              id: item.ida,
              milkdetailid: item.milkdetailid,
              milkTasteName: item.milkTasteName,
              milkDetailDescription: item.milkDetailDescription,
              quantity: item.quantity,
              price: item.price,
              totalAmount: item.totalAmount,
              unit: item.unit,
              capacity: item.capacity,
              status: item.status,
            };
          });

          // Kiểm tra trạng thái để xác định nếu có thể chỉnh sửa
          if ($scope.invoicestatus === 301) {
            $scope.isEditable = true; // Enable các trường nhập liệu
          } else {
            $scope.isEditable = false; // Disable các trường nhập liệu
          }
        } else {
          console.error("Không tìm thấy dữ liệu chi tiết hóa đơn.");
          $scope.showNotification("Không tìm thấy chi tiết hóa đơn.", "error");
        }
      },
      function (error) {
        console.error("Có lỗi khi lấy chi tiết hóa đơn:", error);
        $scope.showNotification(
          "Có lỗi khi lấy chi tiết hóa đơn. Vui lòng thử lại!",
          "error"
        );
      }
    );
  };

  // Check Zalo account by phone number
  $scope.checkZalo = function (phoneNumber) {
    const apiUrl = `http://160.30.21.47:3030/api/customerinfo?phone=${phoneNumber}`;

    $http({
      method: "GET",
      url: apiUrl,
    }).then(
      function (response) {
        if (response.status === 200) {
          const zaloName = response.data.user.zalo_name;
          console.log("Zalo name:", response);

          if (zaloName) {
            $scope.showNotification(
              `Số điện thoại tồn tại trên Zalo! \n Tên Zalo: ${zaloName}`,
              "success"
            );
          } else {
            $scope.showNotification(
              "Số điện thoại tồn tại trên Zalo, nhưng không có tên Zalo.",
              "warning"
            );
          }
        } else if (response.status === 404) {
          $scope.showNotification(
            "Số điện thoại không tồn tại trên Zalo.",
            "error"
          );
        } else {
          $scope.showNotification(
            "Số điện thoại không hợp lệ hoặc có lỗi xảy ra.",
            "error"
          );
        }
      },
      function (error) {
        console.error("Có lỗi khi kiểm tra Zalo:", error);
        $scope.showNotification(
          "Có lỗi khi kiểm tra số điện thoại Zalo. Vui lòng thử lại!",
          "error"
        );
      }
    );
  };
});
