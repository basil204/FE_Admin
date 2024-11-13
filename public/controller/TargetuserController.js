app.controller("TargetuserController", function ($scope, $http, $location) {
  const token = localStorage.getItem("token");
  const API_BASE_URL = "http://localhost:3000/api/Targetuser";

  $scope.targetusers = [];
  $scope.deletedTargetusers = [];
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

  $scope.getTargetusers = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
    }).then(
      function (response) {
        $scope.targetusers = response.data.filter(
          (targetuser) => targetuser.status === 1
        );
      },
      function (error) {
        $scope.showNotification(
          "Không thể tải danh sách loại người dùng",
          "error"
        );
        handleError(error);
      }
    );
  };

  $scope.getDeletedTargetuser = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
    }).then(
      function (response) {
        $scope.deletedTargetusers = response.data.filter(
          (targetuser) => targetuser.status === 0
        );
      },
      function (error) {
        $scope.showNotification(
          "Không thể tải danh sách loại người dùng đã xóa",
          "error"
        );
        handleError(error);
      }
    );
  };

  $scope.getTargetuserById = function (id) {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/${id}`,
    }).then(
      function (response) {
        $scope.formData = response.data;
      },
      function (error) {
        $scope.showNotification(
          "Không thể tải dữ liệu loại người dùng",
          "error"
        );
        handleError(error);
      }
    );
  };

  $scope.deleteTargetuser = function (id) {
    $http({
      method: "DELETE",
      url: `${API_BASE_URL}/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function () {
        $scope.showNotification("Xóa loại người dùng thành công", "success");
        $scope.getTargetusers();
        $scope.getDeletedTargetuser();
      },
      function (error) {
        $scope.showNotification("Không thể xóa loại người dùng", "error");
        handleError(error);
      }
    );
  };
  $scope.RollbackTargetuser = function (id) {
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
        $scope.getTargetusers();
        $scope.getDeletedTargetuser();
      },
      function (error) {
        $scope.showNotification("Không thể khôi phục loại người dùng", "error");
        handleError(error);
      }
    );
  };
  $scope.addTargetuser = function () {
    const isUpdating = !!$scope.formData.id;
    const apiUrl = isUpdating
      ? `${API_BASE_URL}/update/${$scope.formData.id}`
      : `${API_BASE_URL}/add`;

    const targetuserData = {
      targetuser: $scope.formData.targetuser,
      description: $scope.formData.description,
    };
    console.log(targetuserData);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const request = isUpdating
      ? $http.put(apiUrl, targetuserData, config)
      : $http.post(apiUrl, targetuserData, config);

    request.then(
      function (response) {
        $scope.showNotification(
          isUpdating
            ? "Cập nhật loại người dùng thành công"
            : "Thêm loại người dùng mới thành công",
          "success"
        );
        $scope.getTargetusers();
        $scope.formData = {};
      },
      function (error) {
        $scope.showNotification(
          "Không thể thêm/cập nhật loại người dùng",
          "error"
        );
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

  $scope.getTargetusers();
  $scope.getDeletedTargetuser();
});
