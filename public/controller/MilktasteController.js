app.controller(
  "MilktasteController",
  function ($scope, $http, $location, socket) {
    const token = localStorage.getItem("authToken");
    const API_BASE_URL = "http://160.30.21.47:1234/api/Milktaste";

    $scope.milktastes = [];
    $scope.deletedMilktastes = [];
    $scope.formData = {};
    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.getMilktastes = function () {
      $http({
        method: "GET",
        url: `${API_BASE_URL}/getMilktastePage?page=${$scope.currentPage}&size=${$scope.pageSize}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          $scope.pageInfo = response.data.page;
          $scope.milktastes = response.data.content;
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tải danh sách vị sữa"
          );
          $scope.showNotification(errorMessage, "error");
        }
      );
    };

    $scope.addOrUpdateItem = function () {
      // Hiển thị hộp thoại xác nhận trước khi thực hiện thao tác
      Swal.fire({
        title: "Xác nhận",
        text: $scope.formData.id
          ? "Bạn có chắc chắn muốn cập nhật vị sữa này?"
          : "Bạn có chắc chắn muốn thêm vị sữa mới?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Có",
        cancelButtonText: "Không",
      }).then((result) => {
        if (result.isConfirmed) {
          try {
            const method = $scope.formData.id ? "PUT" : "POST";
            const url = $scope.formData.id
              ? `${API_BASE_URL}/update/${$scope.formData.id}`
              : `${API_BASE_URL}/add`;

            const data = {
              milktastename: $scope.formData.milktastename,
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
                    ? "Thêm vị sữa thành công"
                    : "Cập nhật vị sữa thành công");
                $scope.showNotification(message, "success");
                $scope.getMilktastes();
                $scope.resetForm(); // Clear form after success
              },
              function (error) {
                $scope.showNotification(error.data.error, "error");
                $scope.resetForm();
              }
            );
          } catch (exception) {
            console.error("Unexpected error:", exception);
            $scope.showNotification(
              "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
              "error"
            );
          }
        } else {
          // Nếu người dùng chọn "Không", không làm gì
          console.log("User cancelled the operation.");
        }
      });
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
            const message = response.data.message || "Xóa vị sữa thành công";
            $scope.showNotification(message, "success");
            $scope.getMilktastes();
          },
          function (error) {
            const errorMessage = parseErrorMessages(
              error,
              "Không thể xóa vị sữa"
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
            "Không thể tải dữ liệu vị sữa"
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
    $scope.nextPage = function () {
      if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
        $scope.currentPage++;
        $scope.getMilktastes();
      }
    };

    $scope.previousPage = function () {
      if ($scope.currentPage > 0) {
        $scope.currentPage--;
        $scope.getMilktastes();
      }
    };

    $scope.goToFirstPage = function () {
      $scope.currentPage = 0;
      $scope.getMilktastes();
    };

    $scope.goToLastPage = function () {
      $scope.currentPage = $scope.pageInfo.totalPages - 1;
      $scope.getMilktastes();
    };
    $scope.getMilktastes();
  }
);
