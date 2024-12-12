app.controller(
  "TargetuserController",
  function ($scope, $http, $location, socket) {
    const token = localStorage.getItem("authToken");
    const API_BASE_URL = "http://localhost:1234/api/Targetuser";

    $scope.targets = [];
    $scope.formData = {};
    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.getTargets = function () {
      $http({
        method: "GET",
        url: `${API_BASE_URL}/getTargetuserPage?page=${$scope.currentPage}&size=${$scope.pageSize}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          $scope.pageInfo = response.data.page;
          $scope.targets = response.data.content;
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tải danh sách đối tượng sử dụng"
          );
          $scope.showNotification(errorMessage, "error");
        }
      );
    };
    $scope.nextPage = function () {
      if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
        $scope.currentPage++;
        $scope.getTargets();
      }
    };

    $scope.previousPage = function () {
      if ($scope.currentPage > 0) {
        $scope.currentPage--;
        $scope.getTargets();
      }
    };

    $scope.goToFirstPage = function () {
      $scope.currentPage = 0;
      $scope.getTargets();
    };

    $scope.goToLastPage = function () {
      $scope.currentPage = $scope.pageInfo.totalPages - 1;
      $scope.getTargets();
    };
    $scope.addOrUpdateItem = function () {
      try {
        const method = $scope.formData.id ? "PUT" : "POST";
        const url = $scope.formData.id
          ? `${API_BASE_URL}/update/${$scope.formData.id}`
          : `${API_BASE_URL}/add`;

        const data = {
          targetuser: $scope.formData.targetuser,
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
                ? "Thêm đối tượng sử dụng thành công"
                : "Cập nhật đối tượng sử dụng thành công");
            $scope.showNotification(message, "success");
            $scope.getTargets();
            $scope.resetForm(); // Clear form after success
          },
          function (error) {
            if (error.status === 400 && error.data && error.data.errors) {
              // Extract and display only the first validation error
              const firstError = error.data.errors[0];
              const errorMessage = ` ${firstError.message}`;
              $scope.showNotification(errorMessage, "error");
            } else {
              const errorMessage = parseErrorMessages(
                error,
                method === "POST"
                  ? "Không thể thêm đối tượng sử dụng"
                  : "Không thể cập nhật đối tượng sử dụng"
              );
              $scope.showNotification(errorMessage, "error");
            }
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
              response.data.message || "Xóa đối tượng sử dụng thành công";
            $scope.showNotification(message, "success");
            $scope.getTargets();
          },
          function (error) {
            const errorMessage = parseErrorMessages(
              error,
              "Không thể xóa đối tượng sử dụng"
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
            "Không thể tải dữ liệu đối tượng sử dụng"
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

    $scope.getTargets();
  }
);
