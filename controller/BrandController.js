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
        $scope.showNotification("Không thể tải danh sách thương hiệu", "error");
      }
    );
  };

  $scope.addOrUpdateItem = function () {
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
      },
      function (error) {
        const message =
          error.data.message ||
          (method === "POST"
            ? "Không thể thêm thương hiệu"
            : "Không thể cập nhật thương hiệu");
        $scope.showNotification(message, "error");
      }
    );
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
          $scope.showNotification("Không thể xóa thương hiệu", "error");
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
        $scope.showNotification("Không thể tải dữ liệu thương hiệu", "error");
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
        $scope.showNotification(
          "Không thể tải danh sách thương hiệu đã xóa",
          "error"
        );
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

  $scope.getBrands();
});
