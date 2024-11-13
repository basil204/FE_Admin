app.controller("UsagecapacityController", function ($scope, $http, $location) {
  const token = localStorage.getItem("token");
  const API_BASE_URL = "http://localhost:3000/api/Usagecapacity";

  $scope.usagecapacitys = [];
  $scope.deletedUsagecapacitys = [];
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

  $scope.getUsagecapacitys = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
    }).then(
      function (response) {
        $scope.usagecapacitys = response.data.filter(
          (usagecapacity) => usagecapacity.status === 1
        );
      },
      function (error) {
        $scope.showNotification("Không thể tải danh sách công xuất", "error");
        handleError(error);
      }
    );
  };

  $scope.getDeletedUsagecapacitys = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
    }).then(
      function (response) {
        $scope.deletedUsagecapacitys = response.data.filter(
          (usagecapacity) => usagecapacity.status === 0
        );
      },
      function (error) {
        $scope.showNotification(
          "Không thể tải danh sách công xuất đã xóa",
          "error"
        );
        handleError(error);
      }
    );
  };

  $scope.getUsagecapacityById = function (id) {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/${id}`,
    }).then(
      function (response) {
        $scope.formData = response.data;
      },
      function (error) {
        $scope.showNotification("Không thể tải dữ liệu công xuất", "error");
        handleError(error);
      }
    );
  };

  $scope.deleteUsagecapacity = function (id) {
    $http({
      method: "DELETE",
      url: `${API_BASE_URL}/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function () {
        $scope.showNotification("Xóa công xuất thành công", "success");
        $scope.getUsagecapacitys();
        $scope.getDeletedUsagecapacitys();
      },
      function (error) {
        $scope.showNotification("Không thể xóa công xuất sử dụng", "error");
        handleError(error);
      }
    );
  };
  $scope.RollbackUsagecapacity = function (id) {
    $http({
      method: "DELETE",
      url: `${API_BASE_URL}/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function () {
        $scope.showNotification(
          "khôi phục loại người dùng thành công",
          "success"
        );
        $scope.getUsagecapacitys();
        $scope.getDeletedUsagecapacitys();
      },
      function (error) {
        $scope.showNotification("Không thể khôi phục loại người dùng", "error");
        handleError(error);
      }
    );
  };
  $scope.addUsagecapacity = function () {
    const isUpdating = !!$scope.formData.id;
    const apiUrl = isUpdating
      ? `${API_BASE_URL}/update/${$scope.formData.id}`
      : `${API_BASE_URL}/add`;

    const usagecapacityData = {
      capacity: $scope.formData.capacity,
      unit: $scope.formData.unit,
    };
    console.log(usagecapacityData);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const request = isUpdating
      ? $http.put(apiUrl, usagecapacityData, config)
      : $http.post(apiUrl, usagecapacityData, config);

    request.then(
      function (response) {
        $scope.showNotification(
          isUpdating
            ? "Cập nhật công xuất thành công"
            : "Thêm công xuất mới thành công",
          "success"
        );
        $scope.getUsagecapacitys();
        $scope.formData = {};
      },
      function (error) {
        $scope.showNotification("Không thể thêm/cập nhật công xuất", "error");
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

  $scope.getUsagecapacitys();
  $scope.getDeletedUsagecapacitys();
});
