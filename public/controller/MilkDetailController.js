app.controller("MilkDetailController", function ($scope, $http, $location) {
  // Notification Setup
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://160.30.21.47:1234/api";

  if (!token) {
    showNotification(
      "Authentication token is missing. Please log in.",
      "error"
    );
    return;
  }

  // Function to show notifications
  function showNotification(message, type) {
    Swal.fire({
      title: type === "success" ? "Thành công!" : "Lỗi!",
      text: message,
      icon: type,
      confirmButtonText: "OK",
      timer: 3000,
      timerProgressBar: true,
    });
  }

  // Helper function to handle errors
  function parseErrorMessages(error, defaultMessage) {
    if (error && error.data && error.data.message) {
      return error.data.message;
    }
    return defaultMessage;
  }

  // Pagination parameters
  $scope.currentPage = 0;
  $scope.pageSize = 5;
  $scope.formData = {}; // Initialize formData to an empty object

  // Function to reset formData
  $scope.resetForm = function () {
    $scope.formData.imgUrl = ""; // Reset ảnh khi reset form
    $scope.formData = {};
  };
  $scope.uploadImage = function (files) {
    const imgbbApiKey = "588779c93c7187148b4fa9b7e9815da9";
    const file = files[0];

    if (!file) {
      // console.log("No file selected for upload"); // Log no file selection
      return $scope.showNotification("No file selected", "error");
    }

    const formData = new FormData();
    formData.append("key", imgbbApiKey);
    formData.append("image", file);

    $http
      .post("https://api.imgbb.com/1/upload", formData, {
        headers: { "Content-Type": undefined },
        transformRequest: angular.identity,
      })
      .then((response) => {
        const imageUrl = response.data?.data?.url;
        if (imageUrl) {
          $scope.formData.imgUrl = imageUrl;
          $scope.showNotification("Image uploaded successfully", "success");
          // console.log("Image uploaded successfully:", imageUrl); // Log successful upload
        } else {
          $scope.showNotification("Failed to upload image", "error");
        }
      })
      .catch((error) => handleApiError("Failed to upload image", error));
  };
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  $scope.getProducts = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Product/lst`,
      config,
    }).then(
      function (response) {
        if (response.data && Array.isArray(response.data)) {
          $scope.products = response.data;
          console.log($scope.products);
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
          "Không thể tải danh sách Product. Vui lòng thử lại sau."
        );
        showNotification(errorMessage, "error");
      }
    );
  };
  $scope.updateStock = function (id) {
    // Hiển thị thông báo xác nhận trước khi mở modal
    Swal.fire({
      title: "Bạn có chắc chắn muốn cập nhật số lượng tồn kho?",
      text: "Hành động này sẽ thay đổi số lượng tồn kho của sản phẩm.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, cập nhật!",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Nếu người dùng xác nhận, tiếp tục mở modal
        $scope.formData = { newStockQuantity: null, productId: id };
        console.log($scope.formData);
        $("#ModalStockUpdate").modal("show");
      } else {
        // Nếu người dùng hủy bỏ, không làm gì cả
        console.log("Cập nhật tồn kho bị hủy");
      }
    });
  };

  $scope.saveStockUpdate = function (formData) {
    const newQuantity = formData.newStockQuantity;
    const id = formData.productId;

    // Kiểm tra nếu số lượng hợp lệ
    if (newQuantity !== null && !isNaN(newQuantity) && newQuantity >= 0) {
      // Hiển thị thông báo hỏi xác nhận trước khi lưu thay đổi
      Swal.fire({
        title: "Bạn có chắc chắn muốn cập nhật số lượng sản phẩm?",
        text: `Số lượng mới là: ${newQuantity}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Có, cập nhật!",
        cancelButtonText: "Hủy",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          // Nếu người dùng xác nhận, thực hiện lưu thay đổi
          const url = `${API_BASE_URL}/Milkdetail/update-stock/${id}?quantity=${newQuantity}`;

          $http({
            method: "PUT",
            url: url,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }).then(
            function (response) {
              if (response.status === 200) {
                showNotification(
                  "Số lượng sản phẩm đã được cập nhật thành công.",
                  "success"
                );
                $scope.getMilkdetails(); // Refresh danh sách sản phẩm
                $("#ModalStockUpdate").modal("hide"); // Đóng modal sau khi thành công
              } else {
                showNotification(
                  "Không thể cập nhật số lượng sản phẩm. Vui lòng thử lại.",
                  "error"
                );
              }
            },
            function (error) {
              const errorMessage = parseErrorMessages(
                error,
                "Không thể cập nhật số lượng. Vui lòng thử lại."
              );
              showNotification(errorMessage, "error");
            }
          );
        } else {
          // Nếu người dùng hủy bỏ, không làm gì cả
          console.log("Cập nhật số lượng sản phẩm bị hủy");
        }
      });
    } else {
      showNotification("Số lượng không hợp lệ. Vui lòng thử lại.", "error");
    }
  };
  $scope.getMilktypes = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Milktype/lst
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
      url: `${API_BASE_URL}/Targetuser/lst
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
      url: `${API_BASE_URL}/Milkbrand/lst
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
      url: `${API_BASE_URL}/Milktaste/lst`,
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
      url: `${API_BASE_URL}/Packagingunit/lst`,
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
      url: `${API_BASE_URL}/Usagecapacity/lst`,
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
  $scope.searchInvoices = function () {
    let queryParams = [];

    // Lấy các bộ lọc từ mô hình tìm kiếm
    if ($scope.filters.milkTasteId) {
      queryParams.push(`milkTasteId=${$scope.filters.milkTasteId}`);
    }
    if ($scope.filters.packagingUnitId) {
      queryParams.push(`packagingUnitId=${$scope.filters.packagingUnitId}`);
    }
    if ($scope.filters.usageCapacityId) {
      queryParams.push(`usageCapacityId=${$scope.filters.usageCapacityId}`);
    }
    if ($scope.filters.milkBrandId) {
      queryParams.push(`milkBrandId=${$scope.filters.milkBrandId}`);
    }
    if ($scope.filters.targetUserId) {
      queryParams.push(`targetUserId=${$scope.filters.targetUserId}`);
    }
    if ($scope.filters.milkTypeId) {
      queryParams.push(`milkTypeId=${$scope.filters.milkTypeId}`);
    }

    // Mặc định giá trị phân trang nếu không có giá trị
    const currentPage = $scope.currentPage || 1; // Mặc định là trang 1
    const pageSize = $scope.pageSize || 10; // Mặc định là 10 kết quả mỗi trang

    // Thêm tham số phân trang
    queryParams.push(`page=${currentPage}`);
    queryParams.push(`size=${pageSize}`);

    // Nối các tham số lại thành chuỗi query string
    let queryString = queryParams.join("&");

    // Gửi yêu cầu GET với chuỗi query string
    $http({
      method: "GET",
      url: `http://160.30.21.47:1234/api/Milkdetail/filter?${queryString}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then(
      function (response) {
        const data = response.data;
        if (data && data.message.content) {
          // Ánh xạ dữ liệu phản hồi vào mảng Milkdetails
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

  $scope.getMilkdetails = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Milkdetail/getMilkDetailPage?page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        const data = response.data;
        console.log("data milkdetail" + data);
        $scope.pageInfo = data.message.page;

        if (data.status === "success" && data.message && data.message.content) {
          $scope.Milkdetails = data.message.content;
          $scope.deletedMilkdetails = data.message.content.filter(
            (milkdetail) => milkdetail.status === 0
          );
        } else {
          showNotification("Unexpected data format received.", "error");
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Cannot load Milkdetail list. Please try again later."
        );
        showNotification(errorMessage, "error");
      }
    );
  };
  $scope.deleteOrRestoreMilkdetail = function (id, status) {
    let confirmMessage;
    let data = null;
    let title = "";
    let text = "";

    // Thiết lập thông báo xác nhận tùy theo trạng thái
    if (status === 1) {
      title = "Bạn có chắc chắn muốn xóa sản phẩm này?";
      text = "Hành động này không thể hoàn tác.";
    } else {
      title = "Bạn có chắc chắn muốn khôi phục sản phẩm này?";
      text = "Sản phẩm sẽ trở lại trạng thái 'Đang bán'.";
      data = { status: 1 }; // Cập nhật trạng thái sản phẩm thành "Đang bán"
    }

    // Hiển thị thông báo xác nhận bằng Swal.fire
    Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, thực hiện!",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        $http({
          method: "DELETE", // Sử dụng DELETE cho cả xóa và khôi phục
          url: `${API_BASE_URL}/Milkdetail/delete/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: data, // Gửi dữ liệu (chỉ khi khôi phục)
        }).then(
          function (response) {
            let message =
              status === 1
                ? "Sản phẩm đã được xóa thành công."
                : "Sản phẩm đã được khôi phục thành công.";
            showNotification(message, "success");
            $scope.getMilkdetails(); // Refresh danh sách sản phẩm
          },
          function (error) {
            let errorMessage =
              status === 1
                ? "Không thể xóa sản phẩm. Vui lòng thử lại."
                : "Không thể khôi phục sản phẩm. Vui lòng thử lại.";
            showNotification(errorMessage, "error");
          }
        );
      } else {
        // Nếu người dùng hủy bỏ, không làm gì cả
        console.log("Hành động bị hủy.");
      }
    });
  };

  $scope.saveMilkdetail = function (formData) {
    const isUpdate = !!formData.id; // Kiểm tra xem có phải là cập nhật không
    const url = `${API_BASE_URL}/Milkdetail/${
      isUpdate ? "update/" + formData.id : "add"
    }`;
    const method = isUpdate ? "PUT" : "POST";

    const datas = {
      product: { id: formData.product },
      milkTaste: { id: formData.milkTaste },
      packagingunit: { id: formData.packagingunit },
      usageCapacity: { id: formData.usageCapacity },
      description: formData.description,
      shelflifeofmilk: formData.shelflifeofmilk,
      price: formData.price,
      imgUrl: formData.imgUrl,
      stockquantity: formData.stockquantity,
    };

    // Hiển thị thông báo xác nhận trước khi lưu
    Swal.fire({
      title: isUpdate
        ? "Bạn có chắc chắn muốn cập nhật thông tin sản phẩm này?"
        : "Bạn có chắc chắn muốn thêm sản phẩm này?",
      text: isUpdate
        ? "Hành động này sẽ thay đổi thông tin của sản phẩm."
        : "Sản phẩm mới sẽ được thêm vào danh sách.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, thực hiện!",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    })
      .then((result) => {
        if (result.isConfirmed) {
          // Nếu người dùng xác nhận, gửi yêu cầu API
          $http({
            method: method,
            url: url,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            data: datas,
          })
            .then(function (response) {
              // Kiểm tra nếu status là 200
              if (response.status === 200) {
                // Xử lý thành công (status 200)
                console.log("Add milk detail successful:", response.data);

                // Thông báo thành công sử dụng Swal.fire
                Swal.fire({
                  title: "Thành công!",
                  text:
                    "Thông tin sản phẩm đã được " +
                    (isUpdate ? "cập nhật" : "thêm") +
                    " thành công.",
                  icon: "success",
                  confirmButtonText: "Đóng",
                }).then(() => {
                  // Sau khi thông báo thành công, gọi lại danh sách các sản phẩm
                  $scope.getMilkdetails(); // Tải lại danh sách sữa
                  $scope.resetForm(); // Reset lại form
                  $("#ModalUP").modal("hide"); // Đóng modal
                });
              }
            })
            .catch(function (error) {
              // Kiểm tra nếu có lỗi 400
              if (error.status === 400) {
                // Xử lý lỗi (status 400)
                console.error(
                  "Bad request, please check the data:",
                  error.data
                );

                // Thông báo lỗi 400 bằng Swal.fire
                Swal.fire({
                  title: "Lỗi yêu cầu",
                  text:
                    error.data.message ||
                    "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
                  icon: "error",
                  confirmButtonText: "Đóng",
                });
              } else {
                // Xử lý các lỗi khác
                console.error("Error occurred:", error);
                Swal.fire({
                  title: "Lỗi không xác định",
                  text: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
                  icon: "error",
                  confirmButtonText: "Đóng",
                });
              }
            });
        } else {
          console.log("Người dùng đã hủy thao tác.");
        }
      })
      .catch(function (exception) {
        console.error("Lỗi không mong muốn với Swal:", exception);
        Swal.fire({
          title: "Lỗi hệ thống",
          text: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
          icon: "error",
          confirmButtonText: "Đóng",
        });
      });
  };

  $scope.getMilkdetailById = function (id) {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Milkdetail/lst/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        if (response.status === 200) {
          $scope.formData = response.data;
          $scope.formData.milkTaste = response.data.milkTaste.id;
          $scope.formData.packagingunit = response.data.packagingunit.id;
          $scope.formData.usageCapacity = response.data.usageCapacity.id;
          $scope.formData.product = response.data.product.id;
        } else {
          showNotification("Milkdetail not found.", "error");
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Could not retrieve Milkdetail data. Please try again later."
        );
        showNotification(errorMessage, "error");
      }
    );
  };

  // Pagination controls
  $scope.nextPage = function () {
    if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
      $scope.currentPage++;
      if (
        $scope.filters &&
        ($scope.filters.milkTypeId ||
          $scope.filters.targetUserId ||
          $scope.filters.milkBrandId ||
          $scope.filters.usageCapacityId ||
          $scope.filters.packagingUnitId ||
          $scope.filters.milkTasteId)
      ) {
        $scope.searchInvoices();
      } else {
        $scope.getMilkdetails();
      }
    }
  };

  $scope.previousPage = function () {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
      if (
        $scope.filters &&
        ($scope.filters.milkTypeId ||
          $scope.filters.targetUserId ||
          $scope.filters.milkBrandId ||
          $scope.filters.usageCapacityId ||
          $scope.filters.packagingUnitId ||
          $scope.filters.milkTasteId)
      ) {
        $scope.searchInvoices();
      } else {
        $scope.getMilkdetails();
      }
    }
  };

  $scope.goToFirstPage = function () {
    $scope.currentPage = 0;
    if (
      $scope.filters &&
      ($scope.filters.milkTypeId ||
        $scope.filters.targetUserId ||
        $scope.filters.milkBrandId ||
        $scope.filters.usageCapacityId ||
        $scope.filters.packagingUnitId ||
        $scope.filters.milkTasteId)
    ) {
      $scope.searchInvoices();
    } else {
      $scope.getMilkdetails();
    }
  };

  $scope.goToLastPage = function () {
    $scope.currentPage = $scope.pageInfo.totalPages - 1;
    if (
      $scope.filters &&
      ($scope.filters.milkTypeId ||
        $scope.filters.targetUserId ||
        $scope.filters.milkBrandId ||
        $scope.filters.usageCapacityId ||
        $scope.filters.packagingUnitId ||
        $scope.filters.milkTasteId)
    ) {
      $scope.searchInvoices();
    } else {
      $scope.getMilkdetails();
    }
  };

  // Load initial data
  $scope.getProducts();
  $scope.getMilktastes();
  $scope.getPackagingunits();
  $scope.getUsagecapacitys();
  $scope.getMilkdetails();
  $scope.getMilkbrands();

  $scope.getMilktypes();

  $scope.getTargetusers();
});
