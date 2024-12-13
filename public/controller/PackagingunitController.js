app.controller(
  "PackagingunitController",
  function ($scope, $http, $location, socket) {
    const token = localStorage.getItem("authToken");
    const API_BASE_URL = "http://localhost:1234/api/Packagingunit";

    $scope.packas = [];
    $scope.deletedpackas = [];
    $scope.formData = {};
    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.getPackas = function () {
      $http({
        method: "GET",
        url: `${API_BASE_URL}/getPackagingunitPage?page=${$scope.currentPage}&size=${$scope.pageSize}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          $scope.pageInfo = response.data.page;
          $scope.packas = response.data.content;
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
      // Hiển thị hộp thoại xác nhận bằng SweetAlert2
      Swal.fire({
        title: "Xác nhận",
        text: $scope.formData.id
          ? "Bạn có chắc chắn muốn cập nhật loại đóng gói này?"
          : "Bạn có chắc chắn muốn thêm loại đóng gói mới?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Có",
        cancelButtonText: "Không",
      }).then((result) => {
        if (result.isConfirmed) {
          // Nếu người dùng chọn "Có", thực hiện thêm hoặc cập nhật loại đóng gói

          try {
            const method = $scope.formData.id ? "PUT" : "POST";
            const url = $scope.formData.id
              ? `${API_BASE_URL}/update/${$scope.formData.id}`
              : `${API_BASE_URL}/add`;

            const data = {
              packagingunitname: $scope.formData.packagingunitname,
            };

            // Gửi yêu cầu HTTP
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
                $scope.getPackas(); // Lấy lại danh sách loại đóng gói
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
                      ? "Không thể thêm loại đóng gói"
                      : "Không thể cập nhật loại đóng gói"
                  );
                  $scope.showNotification(errorMessage, "error");
                  $scope.getPackas(); // Lấy lại danh sách loại đóng gói
                  $scope.resetForm();
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
        } else {
          // Nếu người dùng chọn "Không", không làm gì cả
          console.log("Hành động đã bị hủy bỏ");
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
            const message =
              response.data.message || "Xóa loại đóng gói thành công";
            $scope.showNotification(message, "success");
            $scope.getPackas();
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
        if ($scope.formData.packagingunitname) {
          $scope.search();
        } else {
          $scope.getPackas();
        }
      }
    };

    $scope.previousPage = function () {
      if ($scope.currentPage > 0) {
        $scope.currentPage--;
        if ($scope.formData.packagingunitname) {
          $scope.search();
        } else {
          $scope.getPackas();
        }
      }
    };

    $scope.goToFirstPage = function () {
      $scope.currentPage = 0;
      if ($scope.formData.packagingunitname) {
        $scope.search();
      } else {
        $scope.getPackas();
      }
    };

    $scope.goToLastPage = function () {
      $scope.currentPage = $scope.pageInfo.totalPages - 1;
      if ($scope.formData.packagingunitname) {
        $scope.search();
      } else {
        $scope.getPackas();
      }
    };

    $scope.search = function () {
      const searchQuery = $scope.formData.packagingunitname;

      if (!searchQuery || searchQuery.trim() === "") {
        $scope.showNotification(
          "Vui lòng nhập tên loại đóng gói để tìm kiếm.",
          "error"
        );
        return;
      }

      $http({
        method: "GET",
        url: `${API_BASE_URL}/getPackagingunitPageByName?packagingunitName=${searchQuery}&page=${$scope.currentPage}&size=${$scope.pageSize}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          $scope.pageInfo = response.data.page;
          $scope.packas = response.data.content;

          if ($scope.brands.length === 0) {
            $scope.showNotification(
              "Không tìm thấy loại đóng gói nào phù hợp.",
              "warning"
            );
            $scope.getPackas(); // Lấy lại danh sách loại đóng gói
            $scope.resetForm();
          }
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tìm kiếm loại đóng gói."
          );
          $scope.showNotification(errorMessage, "error");
          $scope.getPackas(); // Lấy lại danh sách loại đóng gói
          $scope.resetForm();
        }
      );
    };

    $scope.getPackas();
  }
);
