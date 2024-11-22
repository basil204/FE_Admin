app.controller("StaffController", function ($scope, $http, $location) {
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://localhost:1234/api/user";

  // Authorization Header
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch staff list
  $scope.GetStaffs = function () {
    $http.get(`${API_BASE_URL}/lst`, config).then(
      function (response) {
        // Filter out staff with id === 1 from the active staff list
        $scope.staffs = response.data.filter(
          (staff) => staff.status === 1 && staff.id !== 1
        );
        console.log($scope.staffs);

        // Filter out staff with id === 1 from the deleted staff list
        $scope.deletedstaffs = response.data.filter(
          (staff) => staff.status === 0 && staff.id !== 1
        );
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

  // Call the GetStaffs function to load the staff list
  $scope.GetStaffs();
});
