app.controller("BrandController", function ($scope, $http, $location) {
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://160.30.21.47:1234/api/Milkbrand";

  $scope.brands = [];
  $scope.deletedBrands = [];
  $scope.formData = {};

  $scope.getBrands = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.brands = response.data.filter((brand) => brand.status === 1);
        $scope.deletedBrands = response.data.filter(
          (brand) => brand.status === 0
        );
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách thương hiệu"
        );
        $scope.showNotification(errorMessage, "error");
      }
    );
  };

  $scope.addOrUpdateItem = function () {
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
          const errorMessage = parseErrorMessages(
            error,
            method === "POST"
              ? "Không thể thêm thương hiệu"
              : "Không thể cập nhật thương hiệu"
          );
          $scope.showNotification(errorMessage, "error");
        }
      );
    } catch (exception) {
      console.error("Unexpected error:", exception);
      $scope.showNotification(
        "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
        "error"
      );
    }
  };

  $scope.deleteItem = function (id) {
    if (confirm("Bạn có chắc chắn muốn xóa thương hiệu này không?")) {
      $http({
        method: "DELETE",
        url: `${API_BASE_URL}/delete/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          const message = response.data.message || "Xóa thương hiệu thành công";
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
    }
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

  $scope.getDeletedBrands = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.deletedBrands = response.data.filter(
          (brand) => brand.status === 0
        );
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách thương hiệu đã xóa"
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

  $scope.getBrands();
});
