app.controller("MilktasteController", function ($scope, $http, $location) {
  const token = localStorage.getItem("token");
  const API_BASE_URL = "http://localhost:3000/api/Milktaste";

  $scope.Tastes = [];
  $scope.deletedTastes = [];
  $scope.formData = {};
  $scope.notification = { message: "", type: "" };

  $scope.showNotification = function (message, type) {
    $scope.notification.message = message;
    $scope.notification.type = type;
    setTimeout(() => {
      $scope.clearNotification();
      $scope.$apply();
    }, 3000);
  };

  $scope.clearNotification = function () {
    $scope.notification.message = "";
    $scope.notification.type = "";
  };

  $scope.getTastes = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
    }).then(
      function (response) {
        $scope.tastes = response.data.filter((taste) => taste.status === 1);
      },
      function (error) {
        $scope.showNotification("Không thể tải danh sách thương hiệu", "error");
        handleError(error);
      }
    );
  };

  $scope.getDeletedTastes = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
    }).then(
      function (response) {
        $scope.deletedTastes = response.data.filter(
          (Taste) => Taste.status === 0
        );
      },
      function (error) {
        $scope.showNotification(
          "Không thể tải danh sách thương hiệu đã xóa",
          "error"
        );
        handleError(error);
      }
    );
  };

  $scope.getTasteById = function (id) {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/${id}`,
    }).then(
      function (response) {
        $scope.formData = response.data;
      },
      function (error) {
        $scope.showNotification("Không thể tải dữ liệu thương hiệu", "error");
        handleError(error);
      }
    );
  };

  $scope.deleteTaste = function (id) {
    $http({
      method: "DELETE",
      url: `${API_BASE_URL}/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function () {
        $scope.showNotification("Xóa vị sữa thành công", "success");
        $scope.getTastes();
        $scope.getDeletedTastes();
      },
      function (error) {
        $scope.showNotification("Không thể xóa vị sữa", "error");
        handleError(error);
      }
    );
  };
  $scope.RollbackTaste = function (id) {
    $http({
      method: "DELETE",
      url: `${API_BASE_URL}/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function () {
        $scope.showNotification("khôi phục vị sữa thành công", "success");
        $scope.getTastes();
        $scope.getDeletedTastes();
      },
      function (error) {
        $scope.showNotification("Không thể khôi phục vị sữa", "error");
        handleError(error);
      }
    );
  };
  $scope.addTaste = function () {
    const isUpdating = !!$scope.formData.id;
    const apiUrl = isUpdating
      ? `${API_BASE_URL}/update/${$scope.formData.id}`
      : `${API_BASE_URL}/add`;

    const TasteData = {
      milktastename: $scope.formData.milktastename,
    };

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const request = isUpdating
      ? $http.put(apiUrl, TasteData, config)
      : $http.post(apiUrl, TasteData, config);

    request.then(
      function (response) {
        $scope.showNotification(
          isUpdating
            ? "Cập nhật vị sữa thành công"
            : "Thêm vị sữa mới thành công",
          "success"
        );
        $scope.getTastes();
        $scope.formData = {};
      },
      function (error) {
        $scope.showNotification("Không thể thêm/cập nhật vị sữa", "error");
        handleError(error);
      }
    );
  };

  $scope.resetForm = function () {
    $scope.formData = {};
  };

  function handleError(error) {
    console.error("Error:", error);
    if (error.status === 401) {
      $location.path("/login");
    }
  }

  $scope.getTastes();
  $scope.getDeletedTastes();
});
