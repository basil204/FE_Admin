app.controller("PackagingunitController", function ($scope, $http, $location) {
  const token = localStorage.getItem("token");
  const API_BASE_URL = "http://localhost:3000/api/Packagingunit";

  $scope.packagingunits = [];
  $scope.deletedPackagingunits = [];
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

  $scope.getPackagingunits = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
    }).then(
      function (response) {
        $scope.packagingunits = response.data.filter(
          (packagingunit) => packagingunit.status === 1
        );
      },
      function (error) {
        $scope.showNotification("Không thể tải danh sách loại sữa", "error");
        handleError(error);
      }
    );
  };

  $scope.getDeletedPackagingunits = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
    }).then(
      function (response) {
        $scope.deletedPackagingunits = response.data.filter(
          (packagingunit) => packagingunit.status === 0
        );
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

  $scope.getPackagingunitById = function (id) {
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

  $scope.deletePackagingunit = function (id) {
    $http({
      method: "DELETE",
      url: `${API_BASE_URL}/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function () {
        $scope.showNotification("Xóa loại đóng gói thành công", "success");
        $scope.getPackagingunits();
        $scope.getDeletedPackagingunits();
      },
      function (error) {
        $scope.showNotification("Không thể xóa loại đóng gói", "error");
        handleError(error);
      }
    );
  };
  $scope.RollbackPackagingunit = function (id) {
    $http({
      method: "DELETE",
      url: `${API_BASE_URL}/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function () {
        $scope.showNotification(
          "khôi phục loại đóng gói thành công",
          "success"
        );
        $scope.getPackagingunits();
        $scope.getDeletedPackagingunits();
      },
      function (error) {
        $scope.showNotification("Không thể khôi phục loại đóng gói", "error");
        handleError(error);
      }
    );
  };
  $scope.addPackagingunit = function () {
    const isUpdating = !!$scope.formData.id;
    const apiUrl = isUpdating
      ? `${API_BASE_URL}/update/${$scope.formData.id}`
      : `${API_BASE_URL}/add`;

    const packagingunitData = {
      packagingunitname: $scope.formData.packagingunitname,
    };
    console.log(packagingunitData);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const request = isUpdating
      ? $http.put(apiUrl, packagingunitData, config)
      : $http.post(apiUrl, packagingunitData, config);

    request.then(
      function (response) {
        $scope.showNotification(
          isUpdating
            ? "Cập nhật loại đóng gói thành công"
            : "Thêm loại đóng gói mới thành công",
          "success"
        );
        $scope.getPackagingunits();
        $scope.formData = {};
      },
      function (error) {
        $scope.showNotification(
          "Không thể thêm/cập nhật loại đóng gói",
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

  $scope.getPackagingunits();
  $scope.getDeletedPackagingunits();
});
