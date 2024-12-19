app.controller(
  "OrderController",
  function ($scope, $http, $routeParams, $location, AddressService, LocationService) {
    const token = localStorage.getItem("authToken");
    const invoiceId = $routeParams.id;
    const baseUrl = "http://160.30.21.47:1234/api";
    const apiUser = "http://160.30.21.47:1234/api/user/";
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const apiInvoiceDetailByInvoiceID =
      "http://160.30.21.47:1234/api/Invoicedetail/getInvoiceDetailByUser/";
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.addItem = function (item) {  
      const data = {
        id: item.id,
        capacity: item.usageCapacity.capacity,
        milkTypename: item.product.milkType.milkTypename,
        milkbrandname: item.product.milkBrand.milkbrandname,
        milktastename: item.milkTaste.milktastename,
        packagingunitname: item.packagingunit.packagingunitname,
        price: item.price,
        quantity: 1,
        totalprice: item.price * 1,
        unit: item.usageCapacity.unit
      };

      // Kiểm tra xem trong mảng invoiceDetails đã có item với id này chưa
      let existingItem = $scope.invoiceDetails.find(function (invoice) {
        return invoice.id === data.id;
      });

      if (existingItem) {
        // Nếu có, cập nhật số lượng và tổng giá
        existingItem.quantity += 1;  // Tăng số lượng lên 1
        existingItem.totalprice = existingItem.price * existingItem.quantity;  // Cập nhật tổng giá
      } else {
        // Nếu không có, thêm item mới vào mảng
        $scope.invoiceDetails.push(data);
      }


    }
    $scope.amountShip = function () {
      // const data = {
      //   shipment: {
      //     address_from: {
      //       district: "181810", // ngo quyen
      //       city: "180000", //hai phong
      //     },
      //     address_to: {
      //       district: $scope.selectedQuan,
      //       city: $scope.selectedTinh,
      //     },
      //     parcel: {
      //       cod: $scope.calculateTotal(),
      //       amount: $scope.calculateTotal(),
      //       width: 20,
      //       height: 20,
      //       length: 20,
      //       weight: 500,
      //     },
      //   },
      // };
      // ShipService.calculateShipping(data)
      //   .then(function (response) {
      //     $scope.ships = response.data.data;
      //   })
      //   .catch(function (error) {
      //     console.error("API Error:", error);
      //   });
    };
    $scope.user = function () {
      if (userInfo && userInfo.id) {
        // Kiểm tra userInfo và userInfo.id tồn tại
        $http
          .get(apiUser + "profile/" + userInfo.id, config)
          .then(function (response) {
            $scope.userData = response.data; // Lưu dữ liệu vào $scope.userData
            addresssplit = AddressService.splitAddress($scope.userData.address);
            $scope.selectedTinh = $scope.tinhs.find(
              (tinh) => tinh.name === addresssplit[0]
            ).id;
            $scope.loadQuan();
          })
          .catch(function (error) {
            console.error("Error fetching user data:", error);
          });
      } else {
        console.warn("User info is not available."); // Thông báo khi $scope.userInfo chưa có
      }
    };
    $scope.loadTinh = function () {
      LocationService.getCities()
        .then(function (response) {
          $scope.tinhs = response.data.data;
          $scope.user();
        })
        .catch(function (error) {
          console.error("Error loading cities:", error);
        });
    };
    // Hàm xử lý địa chỉ
    $scope.loadQuan = function () {
      var idTinh = $scope.selectedTinh;
      if (idTinh) {
        LocationService.getDistricts(idTinh)
          .then(function (response) {
            $scope.quans = response.data.data;
            if (addresssplit) {
              $scope.selectedQuan = $scope.quans.find(
                (quan) => quan.name === addresssplit[1]
              ).id;
              $scope.loadPhuong();
            }
          })
          .catch(function (error) {
            console.error("Error loading districts:", error);
          });
      }
    };
    $scope.loadPhuong = function () {
      var idQuan = $scope.selectedQuan;
      if (idQuan) {
        LocationService.getWards(idQuan)
          .then(function (response) {
            $scope.phuongs = response.data.data;
            if (addresssplit) {
              $scope.selectedPhuong = $scope.phuongs.find(
                (phuong) => phuong.name === addresssplit[2]
              ).id;
              $scope.detailAddress = addresssplit[3];
              $scope.amountShip();
            }
          })
          .catch(function (error) {
            console.error("Error loading wards:", error);
          });
      }
    };
    $scope.getMilktypes = function () {
      $http({
        method: "GET",
        url: `${baseUrl}/Milktype/lst
`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          if (response.data && Array.isArray(response.data)) {
            $scope.Milktypes = response.data;
            console.log($scope.Milktype);
          } else {
            showNotification(
              "Định dạng dữ liệu nhận được không như mong đợi.",
              "error"
            );
          }
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tải danh sách milktaste. Vui lòng thử lại sau."
          );
          showNotification(errorMessage, "error");
        }
      );
    };
    $scope.getTargetusers = function () {
      $http({
        method: "GET",
        url: `${baseUrl}/Targetuser/lst
`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          if (response.data && Array.isArray(response.data)) {
            $scope.Targetusers = response.data;
            console.log($scope.Targetuser);
          } else {
            showNotification(
              "Định dạng dữ liệu nhận được không như mong đợi.",
              "error"
            );
          }
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tải danh sách milktaste. Vui lòng thử lại sau."
          );
          showNotification(errorMessage, "error");
        }
      );
    };
    $scope.getMilkbrands = function () {
      $http({
        method: "GET",
        url: `${baseUrl}/Milkbrand/lst
`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          if (response.data && Array.isArray(response.data)) {
            $scope.Milkbrands = response.data;
            console.log($scope.Milkbrand);
          } else {
            showNotification(
              "Định dạng dữ liệu nhận được không như mong đợi.",
              "error"
            );
          }
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tải danh sách milktaste. Vui lòng thử lại sau."
          );
          showNotification(errorMessage, "error");
        }
      );
    };
    $scope.getMilktastes = function () {
      $http({
        method: "GET",
        url: `${baseUrl}/Milktaste/lst`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          if (response.data && Array.isArray(response.data)) {
            $scope.milktastes = response.data;
            console.log($scope.milktastes);
          } else {
            showNotification(
              "Định dạng dữ liệu nhận được không như mong đợi.",
              "error"
            );
          }
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tải danh sách milktaste. Vui lòng thử lại sau."
          );
          showNotification(errorMessage, "error");
        }
      );
    };

    $scope.getPackagingunits = function () {
      $http({
        method: "GET",
        url: `${baseUrl}/Packagingunit/lst`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          if (response.data && Array.isArray(response.data)) {
            $scope.packagingunits = response.data;
            console.log($scope.packagingunits);
          } else {
            showNotification(
              "Định dạng dữ liệu nhận được không như mong đợi.",
              "error"
            );
          }
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tải danh sách packagingunit. Vui lòng thử lại sau."
          );
          showNotification(errorMessage, "error");
        }
      );
    };

    $scope.getUsagecapacitys = function () {
      $http({
        method: "GET",
        url: `${baseUrl}/Usagecapacity/lst`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          if (response.data && Array.isArray(response.data)) {
            $scope.usagecapacitys = response.data;
            console.log($scope.usagecapacitys);
          } else {
            showNotification(
              "Định dạng dữ liệu nhận được không như mong đợi.",
              "error"
            );
          }
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tải danh sách usagecapacitys. Vui lòng thử lại sau."
          );
          showNotification(errorMessage, "error");
        }
      );
    };
    $scope.decreaseQuantity = function (item) {
      if (item.quantity > 0) {
        // Check the current stock before decreasing
        $http
          .get(
            `${baseUrl}/Milkdetail/checkcount/${item.milkdetailid}?quantity=${item.quantity - 1
            }`,
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
          `${baseUrl}/Milkdetail/checkcount/${item.milkdetailid}?quantity=${currentQuantity + 1
          }`,
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
      const apiUrl = `${baseUrl}/Milkdetail/checkcount/${item.milkdetailid}?quantity=${item.quantity}`;

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
      if (Array.isArray($scope.invoiceDetails)) {
        // Duyệt qua các phần tử trong mảng để tính tổng totalAmount
        $scope.invoiceDetails.forEach(function (item) {
          total += item.totalprice || 0;
          console.log("total", total)
        });
      } else {
        $scope.invoiceDetails = [];
      }

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

    function formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = ("0" + (d.getMonth() + 1)).slice(-2);
      const day = ("0" + d.getDate()).slice(-2);
      const hours = ("0" + d.getHours()).slice(-2);
      const minutes = ("0" + d.getMinutes()).slice(-2);
      const seconds = ("0" + d.getSeconds()).slice(-2);

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    $scope.searchInvoices = function () {
      // Check if both start and end dates are selected properly
      if (!$scope.search) {
        $scope.search = {};
      }
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

      // Send GET request with query string
      $http({
        method: "GET",
        url: `${baseUrl}/Invoice/search?${queryString}&page=${$scope.currentPage}&size=${$scope.pageSize}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then(
        function (response) {
          const data = response.data;
          if (data && data.content) {
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

    $scope.searchMilkDetail = function () {
      let queryParams = [];

      // Ensure filters are initialized
      if (!$scope.filters) {
        $scope.filters = {};
      }

      // Collect filters from the filter model
      if ($scope.filters.milkTasteId)
        queryParams.push(`milkTasteId=${$scope.filters.milkTasteId}`);
      if ($scope.filters.packagingUnitId)
        queryParams.push(`packagingUnitId=${$scope.filters.packagingUnitId}`);
      if ($scope.filters.usageCapacityId)
        queryParams.push(`usageCapacityId=${$scope.filters.usageCapacityId}`);
      if ($scope.filters.milkBrandId)
        queryParams.push(`milkBrandId=${$scope.filters.milkBrandId}`);
      if ($scope.filters.targetUserId)
        queryParams.push(`targetUserId=${$scope.filters.targetUserId}`);
      if ($scope.filters.milkTypeId)
        queryParams.push(`milkTypeId=${$scope.filters.milkTypeId}`);
      if ($scope.filters.startDate)
        queryParams.push(`startDate=${$scope.filters.startDate}`);
      if ($scope.filters.endDate)
        queryParams.push(`endDate=${$scope.filters.endDate}`);

      // Set pagination if not defined
      const currentPages = $scope.currentPage || 0;
      const pageSizes = $scope.pageSize || 5;

      // Add pagination to query
      queryParams.push(`page=${currentPages}`);
      queryParams.push(`size=${pageSizes}`);

      // Join parameters into query string
      let queryString = queryParams.join("&");

      // Send GET request with query string
      $http({
        method: "GET",
        url: `${baseUrl}/Milkdetail/filtershop?${queryString}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then(
        function (response) {
          const data = response.data;
          if (data && data.message.content) {
            $scope.Milkdetails = data.message.content;
            $scope.pageInfo = data.message.page;
          }
        },
        function (error) {
          console.error("Error fetching milk details:", error);
          $scope.showNotification("Không cho sản phẩm này", "error");
        }
      );
    };

    // Pagination Controls for Invoices
    $scope.nextPage = function () {
      if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
        $scope.currentPage++;
        $scope.searchInvoices();
      }
    };

    $scope.previousPage = function () {
      if ($scope.currentPage > 0) {
        $scope.currentPage--;
        $scope.searchInvoices();
      }
    };

    $scope.goToFirstPage = function () {
      $scope.currentPage = 0;
      $scope.searchInvoices();
    };

    $scope.goToLastPage = function () {
      $scope.currentPage = $scope.pageInfo.totalPages - 1;
      $scope.searchInvoices();
    };

    // Pagination Controls for Milk Detail
    $scope.nextPages = function () {
      if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
        $scope.currentPage++;
        $scope.searchMilkDetail();
      }
    };

    $scope.previousPages = function () {
      if ($scope.currentPage > 0) {
        $scope.currentPage--;
        $scope.searchMilkDetail();
      }
    };

    $scope.goToFirstPages = function () {
      $scope.currentPage = 0;
      $scope.searchMilkDetail();
    };

    $scope.goToLastPages = function () {
      $scope.currentPage = $scope.pageInfo.totalPages - 1;
      $scope.searchMilkDetail();
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
              $scope.searchInvoices(); // Lấy danh sách hóa đơn mới
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
    $scope.navigateToInvoiceDetail = function (invoiceId) {
      $location.path("/invicedetail/" + invoiceId);
    };
    // Fetch invoice details by ID and load items
    if (invoiceId) {
      $scope.getInvoiceDetailById = function () {
        if (invoiceId != null) {
          $http
            .get(apiInvoiceDetailByInvoiceID + invoiceId, config)
            .then(function (response) {
              $scope.invoiceDetails = response.data.message;
              console.log($scope.invoiceDetails)
            })
            .catch(function (error) {
              console.error("Error fetching invoice details:", error);
            });
        }
      };

      // Gọi hàm khi controller được khởi tạo
      $scope.getInvoiceDetailById();
    } else {
      console.error("Không có mã hóa đơn trong URL.");
    }

    $scope.resetFilters = function () {
      // Đặt lại các bộ lọc về giá trị mặc định
      $scope.filters = {
        milkTasteId: null,
        milkBrandId: null,
        targetUserId: null,
        milkTypeId: null,
        usageCapacityId: null,
        packagingUnitId: null,
        productSearch: "", // hoặc giá trị mặc định khác cho ô tìm kiếm
      };

      // Đặt lại trang hiện tại về trang đầu tiên
      $scope.currentPage = 0;

      // Gọi lại hàm tìm kiếm sau khi reset
      $scope.searchMilkDetail();
    };

    $scope.getMilktastes();
    $scope.getPackagingunits();
    $scope.getUsagecapacitys();
    $scope.getMilkbrands();
    $scope.getTargetusers();
    $scope.getMilktypes();
    $scope.searchInvoices();
    $scope.searchMilkDetail();
    $scope.loadTinh()
  }
);
