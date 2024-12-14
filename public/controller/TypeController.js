app.controller(
  "MilktypeController",
  function ($scope, $http, $location, socket) {
    const token = localStorage.getItem("authToken");
    const API_BASE_URL = "http://localhost:1234/api/Milktype";

    $scope.types = [];
    $scope.formData = {};
    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.getTypes = function () {
      $http({
        method: "GET",
        url: `${API_BASE_URL}/getTypePage?page=${$scope.currentPage}&size=${$scope.pageSize}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          $scope.pageInfo = response.data.page;
          $scope.types = response.data.content;
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tải danh sách loại sữa"
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
          ? "Bạn có chắc chắn muốn cập nhật loại sữa này?"
          : "Bạn có chắc chắn muốn thêm loại sữa mới?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Có",
        cancelButtonText: "Không",
      }).then((result) => {
        if (result.isConfirmed) {
          // Nếu người dùng chọn "Có", thực hiện thêm hoặc cập nhật

          try {
            const method = $scope.formData.id ? "PUT" : "POST";
            const url = $scope.formData.id
              ? `${API_BASE_URL}/update/${$scope.formData.id}`
              : `${API_BASE_URL}/add`;

            const data = {
              milkTypename: $scope.formData.milkTypename,
              description: $scope.formData.description,
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
                    ? "Thêm loại sữa thành công"
                    : "Cập nhật loại sữa thành công");
                $scope.showNotification(message, "success");
                $scope.getTypes();
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
                      ? "Không thể thêm loại sữa"
                      : "Không thể cập nhật loại sữa"
                  );
                  $scope.showNotification(errorMessage, "error");
                  $scope.getTypes();
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
            const message = response.data.message || "Xóa loại sữa thành công";
            $scope.showNotification(message, "success");
            $scope.getTypes();
          },
          function (error) {
            const errorMessage = parseErrorMessages(
              error,
              "Không thể xóa loại sữa"
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
            "Không thể tải dữ liệu loại sữa"
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
        if ($scope.formData.milkTypename) {
          $scope.search();
        } else {
          $scope.getTypes();
        }
      }
    };
    $scope.previousPage = function () {
      if ($scope.currentPage > 0) {
        $scope.currentPage--;
        if ($scope.formData.milkTypename) {
          $scope.search();
        } else {
          $scope.getTypes();
        }
      }
    };
    $scope.goToFirstPage = function () {
      $scope.currentPage = 0;
      if ($scope.formData.milkTypename) {
        $scope.search();
      } else {
        $scope.getTypes();
      }
    };
    $scope.goToLastPage = function () {
      $scope.currentPage = $scope.pageInfo.totalPages - 1;
      if ($scope.formData.milkTypename) {
        $scope.search();
      } else {
        $scope.getTypes();
      }
    };
    $scope.search = function () {
      const searchQuery = $scope.formData.milkTypename;
      if (!searchQuery || searchQuery.trim() === "") {
        $scope.showNotification(
          "Vui lòng nhập tên loại sữa để tìm kiếm.",
          "error"
        );
        return;
      }
      $http({
        method: "GET",
        url: `${API_BASE_URL}/getTypePageByName?milkTypeName=${searchQuery}&page=${$scope.currentPage}&size=${$scope.pageSize}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          $scope.pageInfo = response.data.page;
          $scope.types = response.data.content;
          if ($scope.brands.length === 0) {
            $scope.showNotification(
              "Không tìm thấy loại sữa nào phù hợp.",
              "warning"
            );
            $scope.getTypes();
            $scope.resetForm();
          }
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tìm kiếm loại sữa."
          );
          $scope.showNotification(errorMessage, "error");
          $scope.getTypes();
          $scope.resetForm();
        }
      );
    };
    $scope.getTypes();
  }
);
