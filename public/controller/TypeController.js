app.controller("TypeController", function ($scope, $http, $location) {
  const token = localStorage.getItem("token");
  const API_BASE_URL = "http://localhost:3000/api/Milktype";

  $scope.types = [];
  $scope.deletedTypes = [];
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

  $scope.getTypes = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
    }).then(
      function (response) {
        $scope.types = response.data.filter((type) => type.status === 1);
      },
      function (error) {
        $scope.showNotification("Không thể tải danh sách loại sữa", "error");
        handleError(error);
      }
    );
  };

  $scope.getDeletedTypes = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
    }).then(
      function (response) {
        $scope.deletedTypes = response.data.filter((type) => type.status === 0);
      },
      function (error) {
        $scope.showNotification(
          "Không thể tải danh sách loại sữa đã xóa",
          "error"
        );
        handleError(error);
      }
    );
  };

  $scope.getTypeById = function (id) {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/${id}`,
    }).then(
      function (response) {
        $scope.formData = response.data;
      },
      function (error) {
        $scope.showNotification("Không thể tải dữ liệu loại sữa", "error");
        handleError(error);
      }
    );
  };

  $scope.deleteType = function (id) {
    $http({
      method: "DELETE",
      url: `${API_BASE_URL}/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function () {
        $scope.showNotification("Xóa loại sữa thành công", "success");
        $scope.getTypes();
        $scope.getDeletedTypes();
      },
      function (error) {
        $scope.showNotification("Không thể xóa loại sữa", "error");
        handleError(error);
      }
    );
  };
  $scope.RollbackType = function (id) {
    $http({
      method: "DELETE",
      url: `${API_BASE_URL}/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function () {
        $scope.showNotification("khôi phục loại sữa thành công", "success");
        $scope.getTypes();
        $scope.getDeletedTypes();
      },
      function (error) {
        $scope.showNotification("Không thể khôi phục loại sữa", "error");
        handleError(error);
      }
    );
  };
  $scope.addType = function () {
    const isUpdating = !!$scope.formData.id;
    const apiUrl = isUpdating
      ? `${API_BASE_URL}/update/${$scope.formData.id}`
      : `${API_BASE_URL}/add`;

    const typeData = {
      milkTypename: $scope.formData.milkTypename,
      description: $scope.formData.description,
    };
    console.log(typeData);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const request = isUpdating
      ? $http.put(apiUrl, typeData, config)
      : $http.post(apiUrl, typeData, config);

    request.then(
      function (response) {
        $scope.showNotification(
          isUpdating
            ? "Cập nhật loại sữa thành công"
            : "Thêm loại sữa mới thành công",
          "success"
        );
        $scope.getTypes();
        $scope.formData = {};
      },
      function (error) {
        $scope.showNotification("Không thể thêm/cập nhật loại sữa", "error");
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

  $scope.getTypes();
  $scope.getDeletedTypes();
});
