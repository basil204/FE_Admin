app.controller("PackagingunitController", function ($scope, $http, $location) {
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://160.30.21.47:1234/api/Packagingunit";

  $scope.packas = [];
  $scope.deletedpackas = [];
  $scope.formData = {};

  $scope.getPackas = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.packas = response.data.filter((packa) => packa.status === 1);
        console.log($scope.packas);
        $scope.deletedpackas = response.data.filter(
          (packa) => packa.status === 0
        );
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách loại đóng gói"
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
        packagingunitname: $scope.formData.packagingunitname,
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
              ? "Thêm loại đóng gói thành công"
              : "Cập nhật loại đóng gói thành công");
          $scope.showNotification(message, "success");
          $scope.getPackas();
          $scope.resetForm(); // Clear form after success
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            method === "POST"
              ? "Không thể thêm loại đóng gói"
              : "Không thể cập nhật loại đóng gói"
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
    if (confirm("Bạn có chắc chắn muốn thực hiện hành động này không")) {
      $http({
        method: "DELETE",
        url: `${API_BASE_URL}/delete/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          const message =
            response.data.message || "Xóa loại đóng gói thành công";
          $scope.showNotification(message, "success");
          $scope.getPackas();
          $scope.getDeletedPackas();
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể xóa loại đóng gói"
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
          "Không thể tải dữ liệu loại đóng gói"
        );
        $scope.showNotification(errorMessage, "error");
      }
    );
  };

  $scope.getDeletedPackas = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.deletedpackas = response.data.filter(
          (packa) => packa.status === 0
        );
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách loại đóng gói đã xóa"
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

  $scope.getPackas();
  $scope.getDeletedPackas();
});
