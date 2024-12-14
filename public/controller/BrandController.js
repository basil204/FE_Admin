app.controller("BrandController", function ($scope, $http, $location, socket) {
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://localhost:1234/api/Milkbrand";
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  $scope.brands = [];
  $scope.formData = {};
  $scope.currentPage = 0;
  $scope.pageSize = 5;
  $scope.getBrands = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/getMilkBrandPage?page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.pageInfo = response.data.page;
        $scope.brands = response.data.content;
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách thương hiệu"
        );
        $scope.showNotification(errorMessage, "error");
        $scope.getBrands();
        $scope.resetForm();
      }
    );
  };

  $scope.addOrUpdateItem = function () {
    // Ask for confirmation before adding or updating
    Swal.fire({
      title: "Xác nhận",
      text: $scope.formData.id
        ? "Bạn có chắc chắn muốn cập nhật thương hiệu này?"
        : "Bạn có chắc chắn muốn thêm thương hiệu mới?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          const method = $scope.formData.id ? "PUT" : "POST";
          const url = $scope.formData.id
            ? `${API_BASE_URL}/update/${$scope.formData.id}`
            : `${API_BASE_URL}/add`;

          const data = {
            milkbrandname: $scope.formData.milkbrandname,
            description: $scope.formData.description,
          };

          $http({
            method,
            url,
            data: data,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(
            function (response) {
              const message =
                response.data.message ||
                (method === "POST"
                  ? "Thêm thương hiệu thành công"
                  : "Cập nhật thương hiệu thành công");
              $scope.showNotification(message, "success");
              $scope.getBrands();
              $scope.resetForm(); // Clear form after success
            },
            function (error) {
              if (error.status === 400 && error.data && error.data.errors) {
                // Extract and display only the first validation error
                const firstError = error.data.errors[0];
                const errorMessage = ` ${firstError.message}`;
                $scope.showNotification(errorMessage, "error");
              } else {
                const errorMessage = parseErrorMessages(
                  error,
                  method === "POST"
                    ? "Không thể thêm thương hiệu"
                    : "Không thể cập nhật thương hiệu"
                );
                $scope.showNotification(errorMessage, "error");
              }
            }
          );
        } catch (exception) {
          console.error("Unexpected error:", exception);
          $scope.showNotification(
            "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
            "error"
          );
        }
      }
    });
  };

  $scope.deleteItem = function (id) {
    Swal.fire({
      title: "Bạn có chắc chắn muốn thực hiện hành động này không?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, xóa!",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Nếu người dùng xác nhận, thực hiện xóa
        $http({
          method: "DELETE",
          url: `${API_BASE_URL}/delete/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then(
          function (response) {
            const message =
              response.data.message || "Xóa thương hiệu thành công";
            $scope.showNotification(message, "success");
            $scope.getBrands();
          },
          function (error) {
            const errorMessage = parseErrorMessages(
              error,
              "Không thể xóa thương hiệu"
            );
            $scope.showNotification(errorMessage, "error");
          }
        );
      } else {
        // Nếu người dùng hủy bỏ
        console.log("Hủy xóa thương hiệu");
      }
    });
  };

  $scope.getItemById = function (id) {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.formData = response.data;
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải dữ liệu thương hiệu"
        );
        $scope.showNotification(errorMessage, "error");
      }
    );
  };
  $scope.resetForm = function () {
    $scope.formData = {};
  };

  // SweetAlert2 notification function
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

  // Helper function to parse error messages
  function parseErrorMessages(error, defaultMessage) {
    if (error.data && error.data.errors && Array.isArray(error.data.errors)) {
      return error.data.errors.map((err) => err.message).join("\n");
    }
    return defaultMessage;
  }
  $scope.nextPage = function () {
    if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
      $scope.currentPage++;
      if ($scope.formData.milkbrandname) {
        $scope.search();
      } else {
        $scope.getBrands();
      }
    }
  };

  $scope.previousPage = function () {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
      if ($scope.formData.milkbrandname) {
        $scope.search();
      } else {
        $scope.getBrands();
      }
    }
  };

  $scope.goToFirstPage = function () {
    $scope.currentPage = 0;
    if ($scope.formData.milkbrandname) {
      $scope.search();
    } else {
      $scope.getBrands();
    }
  };

  $scope.goToLastPage = function () {
    $scope.currentPage = $scope.pageInfo.totalPages - 1;
    if ($scope.formData.milkbrandname) {
      $scope.search();
    } else {
      $scope.getBrands();
    }
  };
  $scope.search = function () {
    const searchQuery = $scope.formData.milkbrandname;
    if (!searchQuery || searchQuery.trim() === "") {
      $scope.showNotification(
        "Vui lòng nhập tên thương hiệu để tìm kiếm.",
        "error"
      );
      $scope.resetForm();
      return;
    }
    $http({
      method: "GET",
      url: `${API_BASE_URL}/getMilkBrandsearch?milkbrandname=${searchQuery}&page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.pageInfo = response.data.page;
        $scope.brands = response.data.content;
        if ($scope.brands.length === 0) {
          $scope.showNotification(
            "Không tìm thấy thương hiệu nào phù hợp.",
            "warning"
          );
          $scope.resetForm();
          $scope.getBrands();
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tìm kiếm thương hiệu."
        );
        $scope.showNotification(errorMessage, "error");
        $scope.resetForm();
        $scope.getBrands();
      }
    );
  };

  $scope.getBrands();
});
