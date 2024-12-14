app.controller("StaffController", function ($scope, $http, $location) {
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://localhost:1234/api";

  // Authorization Header
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  $scope.formData = {};
  // Fetch staff list
  $scope.GetStaffs = function () {
    $http.get(`${API_BASE_URL}/user/lst`, config).then(
      function (response) {
        console.log(response.data);
        $scope.staffs = response.data.filter((staff) => staff.role.id !== 1);
        console.log($scope.staffs);
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách nhân viên"
        );
        $scope.showNotification(errorMessage, "error");
      }
    );
  };

  $scope.GetCustomers = function () {
    $http.get(`${API_BASE_URL}/user/lst`, config).then(
      function (response) {
        console.log(response.data);
        $scope.customers = response.data.filter((staff) => staff.role.id === 2);
        console.log($scope.customers);
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách nhân viên"
        );
        $scope.showNotification(errorMessage, "error");
      }
    );
  };

  $scope.deleteItem = function (id) {
    // Ask for confirmation before deleting
    Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn muốn thực hiện hành động này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with the deletion if confirmed
        $http({
          method: "DELETE",
          url: `${API_BASE_URL}/user/delete/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then(
          function (response) {
            const message =
              response.data.message || "Xóa người dùng thành công";
            $scope.showNotification(message, "success");
            $scope.GetCustomers();
            $scope.GetStaffs();
          },
          function (error) {
            const errorMessage = parseErrorMessages(
              error,
              "Không thể xóa người dùng"
            );
            $scope.showNotification(errorMessage, "error");
          }
        );
      }
    });
  };

  $scope.getItemById = function (id) {
    $http.get(`${API_BASE_URL}/user/lst/${id}`, config).then(
      function (response) {
        $scope.formData = response.data;
        console.log($scope.formData);
        $scope.formData.role = response.data.role.id;
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải dữ liệu người dùng"
        );
        $scope.showNotification(errorMessage, "error");
      }
    );
  };
  $scope.resetForm = function () {
    $scope.formData = {};
  };
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
  $scope.getRoles = function () {
    $http.get(`${API_BASE_URL}/role/lst`, config).then(
      function (response) {
        $scope.roles = response.data.filter((role) => role.id !== 1);
        console.log($scope.roles);
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách chức vụ"
        );
        $scope.showNotification(errorMessage, "error");
      }
    );
  };

  $scope.updateItem = function () {
    // Ask for confirmation before updating
    Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn muốn cập nhật tài khoản này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with the update if confirmed
        try {
          console.log($scope.formData);
          const url = `${API_BASE_URL}/user/update/${$scope.formData.id}`;
          const data = {
            fullname: $scope.formData.fullname,
            phonenumber: $scope.formData.phonenumber,
            email: $scope.formData.email,
            role: { id: $scope.formData.role },
          };

          $http({
            method: "PUT",
            url: url,
            data: data,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(
            function (response) {
              const message =
                response.data.message || "Cập nhật tài khoản thành công";
              $scope.showNotification(message, "success");
              $scope.GetCustomers();
              $scope.GetStaffs();
              $scope.resetForm(); // Clear form after success
            },
            function (error) {
              const errorMessage = parseErrorMessages(
                error,
                "Không thể cập nhật tài khoản"
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
      }
    });
  };

  $scope.GetCustomers();
  $scope.getRoles();
  $scope.GetStaffs();
});
