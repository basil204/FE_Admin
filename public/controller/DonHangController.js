app.controller("DonHangController", function ($scope, $http, socket) {
  const token = localStorage.getItem("authToken");
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  $scope.invoices = [];
  const Toast = Swal.mixin({
    toast: true,
    position: "top-right",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const baseUrl = "http://localhost:1234/api";

  $scope.decreaseQuantity = function (item) {
    if (item.quantity > 0) {
      // Check the current stock before decreasing
      $http
        .get(
          `http://localhost:1234/api/Milkdetail/checkcount/${
            item.milkdetailid
          }?quantity=${item.quantity - 1}`,
          config
        )
        .then(function (response) {
          if (response.status === 200) {
            // If the stock check is successful and the quantity can be decreased
            item.quantity--;
            item.quantity = 1;
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
        `http://localhost:1234/api/Milkdetail/checkcount/${
          item.milkdetailid
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
    const apiUrl = `http://localhost:1234/api/Milkdetail/checkcount/${item.milkdetailid}?quantity=${item.quantity}`;

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
  $scope.calculateTotalInvoiceAmount = function () {
    let total = 0;

    // Ensure that $scope.items is an array before calling forEach
    if (Array.isArray($scope.items)) {
      $scope.items.forEach(function (item) {
        if (item.totalAmount) {
          total += item.totalAmount;
        }
      });
    }
    return total;
  };
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
  $scope.statusMap = {
    0: "Không hoạt động",
    1: "Hoạt động",
    336: "Huỷ Đơn",
    913: "Hoàn thành",
    901: "Chờ lấy hàng",
    903: "Đã lấy hàng",
    904: "Giao hàng",
    301: "Chờ Duyệt Đơn",
    337: "Chưa Thanh Toán",
    338: "Đơn Chờ",
    305: "Thanh toán thành công",
  };
  // Hàm lấy trạng thái từ mã trạng thái
  $scope.getStatus = function (statusCode) {
    return $scope.statusMap[statusCode] || "Không xác định";
  };
  if (!socket.isConnected) {
    socket.connect().then(function () {
      socket.subscribe(
        `/user/${userInfo.sub}/queue/messages`,
        function (message) {
          console.log(message);
          $scope.loadInvoice(message);
        }
      );
      socket.subscribe("/topic/messages", function (message) {
        Toast.fire({
          icon: "info",
          title: `Hóa đơn #${message} đã được đặt!`,
        });
      });
      socket.sendMessage("/app/cod", "a");
    });
  }
  $scope.invoiceOk = function (invoiceID) {
    Swal.fire({
      title: "Bạn có chắc muốn duyệt hóa đơn này?", // Question text
      text: "Hành động này không thể hoàn tác!", // Optional extra text
      icon: "question", // Icon type (question icon)
      showCancelButton: true, // Show cancel button
      confirmButtonText: "Duyệt", // Text for the confirm button
      cancelButtonText: "Hủy", // Text for the cancel button
      reverseButtons: true, // Optional: makes the cancel button appear on the left
    }).then((result) => {
      if (result.isConfirmed) {
        const url = `http://localhost:1234/api/Invoice/waiting/${invoiceID}`;
        // Use Angular's $http for better integration
        $http
          .put(url, Number(userInfo.id), config)
          .then((response) => {
            if (response.data.success) {
              socket.sendMessage("/app/cod", "a");
              $scope.showNotification("Duyệt hóa đơn thành công!", "success");
            } else {
              $scope.showNotification(
                "Có lỗi xảy ra khi duyệt hóa đơn.",
                "error"
              );
            }
          })
          .catch((error) => {
            $scope.showNotification("Lỗi kết nối hoặc lỗi server.", "error");
            console.error("Error:", error);
          });
      } else {
        console.log("Hủy duyệt hóa đơn.");
      }
    });
  };

  // Function to show notifications using Swal
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
  $scope.loadInvoice = function (invoice) {
    $scope.invoices = invoice;
    $scope.$apply();
  };
});
