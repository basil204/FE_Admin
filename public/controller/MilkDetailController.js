app.controller(
  "MilkDetailController",
  function ($scope, $http, $location, socket) {
    // Notification Setup
    const token = localStorage.getItem("authToken");
    // const API_BASE_URL = "http://160.30.21.47:1234/api";
    const API_BASE_URL = "http://localhost:1234/api";

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
      // Set the product ID in the form to use later in the save function
      $scope.formData = { newStockQuantity: null, productId: id };
      console.log($scope.formData);
      // Open the modal to enter the new stock quantity
      $("#ModalStockUpdate").modal("show");
    };

    $scope.saveStockUpdate = function (formData) {
      const newQuantity = formData.newStockQuantity;
      const id = formData.productId;

      if (newQuantity !== null && !isNaN(newQuantity) && newQuantity >= 0) {
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
              $("#ModalStockUpdate").modal("hide"); // Close the modal after success
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
        showNotification("Số lượng không hợp lệ. Vui lòng thử lại.", "error");
      }
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

          if (
            data.status === "success" &&
            data.message &&
            data.message.content
          ) {
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

      if (status === 1) {
        confirmMessage = "Bạn có chắc chắn muốn xóa sản phẩm này?"; // Xóa khi sản phẩm đang bán
      } else {
        confirmMessage = "Bạn có chắc chắn muốn khôi phục sản phẩm này?"; // Khôi phục khi sản phẩm đã ngừng bán
        data = { status: 1 }; // Cập nhật trạng thái sản phẩm thành "Đang bán"
      }

      const confirmAction = confirm(confirmMessage);
      if (confirmAction) {
        $http({
          method: "DELETE", // Chỉ sử dụng DELETE cho cả xóa và khôi phục
          url: `${API_BASE_URL}/Milkdetail/delete/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: data, // Gửi dữ liệu (chỉ khi khôi phục)
        }).then(
          function (response) {
            if (response.status === 200) {
              let message =
                status === 1
                  ? "Sản phẩm đã được xóa thành công."
                  : "Sản phẩm đã được khôi phục thành công.";
              showNotification(message, "success");
              $scope.getMilkdetails(); // Refresh danh sách sản phẩm
            } else {
              let message =
                status === 1
                  ? "Không thể xóa sản phẩm. Vui lòng thử lại."
                  : "Không thể khôi phục sản phẩm. Vui lòng thử lại.";
              showNotification(message, "error");
            }
          },
          function (error) {
            const errorMessage = parseErrorMessages(
              error,
              status === 1
                ? "Không thể xóa sản phẩm. Vui lòng thử lại."
                : "Không thể khôi phục sản phẩm. Vui lòng thử lại."
            );
            showNotification(errorMessage, "error");
          }
        );
      }
    };

    $scope.saveMilkdetail = function (formData) {
      const isUpdate = !!formData.id;
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

      $http({
        method: method,
        url: url,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: datas,
      }).then(
        function (response) {
          if (response.status === 200) {
            showNotification(
              isUpdate
                ? "Milkdetail updated successfully."
                : "Milkdetail added successfully.",
              "success"
            );
            $scope.getMilkdetails(); // Refresh the list
            $scope.resetForm(); // Clear the form data
            $("#ModalUP").modal("hide"); // Đóng MODAL khi thành công
          } else {
            showNotification(
              isUpdate
                ? "Failed to update Milkdetail."
                : "Failed to add Milkdetail.",
              "error"
            );
          }
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            isUpdate
              ? "Could not update Milkdetail. Please try again later."
              : "Could not add Milkdetail. Please try again later."
          );
          showNotification(errorMessage, "error");
        }
      );
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
        $scope.getMilkdetails();
      }
    };

    $scope.previousPage = function () {
      if ($scope.currentPage > 0) {
        $scope.currentPage--;
        $scope.getMilkdetails();
      }
    };

    $scope.goToFirstPage = function () {
      $scope.currentPage = 0;
      $scope.getMilkdetails();
    };

    $scope.goToLastPage = function () {
      $scope.currentPage = $scope.pageInfo.totalPages - 1;
      $scope.getMilkdetails();
    };

    // Load initial data
    $scope.getProducts();
    $scope.getMilktastes();
    $scope.getPackagingunits();
    $scope.getUsagecapacitys();
    $scope.getMilkdetails();

    // Đây chính là phân bạn sẽ cập nhật lại từ mỗi danh sách sang danh sách có phân trang giông getMilkDetail() ở trên kia
    // Các hàm gọi API để lấy dữ liệu cho các bộ lọc
    $scope.getMilkBrands = function () {
      $http({
        method: "GET",
        url: `${API_BASE_URL}/Milkbrand/lst`,
        headers: { Authorization: `Bearer ${token}` },
      }).then(
        function (response) {
          $scope.milkBrands = response.data;
        },
        function (error) {
          showNotification(
            "Không thể tải danh sách milkbrand. Vui lòng thử lại sau.",
            "error"
          );
        }
      );
    };

    $scope.getTargetUsers = function () {
      $http({
        method: "GET",
        url: `${API_BASE_URL}/Targetuser/lst`,
        headers: { Authorization: `Bearer ${token}` },
      }).then(
        function (response) {
          $scope.targetUsers = response.data;
        },
        function (error) {
          showNotification(
            "Không thể tải danh sách targetuser. Vui lòng thử lại sau.",
            "error"
          );
        }
      );
    };

    $scope.getMilkTypes = function () {
      $http({
        method: "GET",
        url: `${API_BASE_URL}/Milktype/lst`,
        headers: { Authorization: `Bearer ${token}` },
      }).then(
        function (response) {
          $scope.milkTypes = response.data;
        },
        function (error) {
          showNotification(
            "Không thể tải danh sách milktype. Vui lòng thử lại sau.",
            "error"
          );
        }
      );
    };
    

    // Hàm lọc chi tiết sản phẩm sữa
    $scope.filterMilkDetails = function () {
      $http({
        method: "GET",
        url: `${API_BASE_URL}/Milkdetail/filter`,
        params: {
          ...$scope.filters,
          page: $scope.currentPage,
          size: $scope.pageSize
        },
        headers: { Authorization: `Bearer ${token}` },
      }).then(
        function (response) {
          if (response.data.status === "success") {
            const data = response.data.message;
            $scope.Milkdetails = data.content;
            $scope.pageInfo = data.page;
          } else {
            showNotification("Không tìm thấy dữ liệu phù hợp.", "error");
          }
        },
        function (error) {
          showNotification("Lỗi khi lọc chi tiết sản phẩm.", "error");
        }
      );
    };
    
    // Gọi hàm lấy dữ liệu ngay khi khởi tạo controller
    $scope.getMilkBrands();
    $scope.getMilkTypes();
    $scope.getTargetUsers();
    $scope.filterMilkDetails();
  }
);