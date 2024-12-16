app.controller("TargetuserController", function ($scope, $http, $location) {
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://160.30.21.47:1234/api/Targetuser";

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
      if ($scope.formData.targetname) {
        $scope.resetFormTaget();
      } else {
        $scope.getTargets();
      }
    }
  };
  $scope.previousPage = function () {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
      if ($scope.formData.targetname) {
        $scope.resetFormTaget();
      } else {
        $scope.getTargets();
      }
    }
  };
  $scope.goToFirstPage = function () {
    $scope.currentPage = 0;
    if ($scope.formData.targetname) {
      $scope.resetFormTaget();
    } else {
      $scope.getTargets();
    }
  };
  $scope.goToLastPage = function () {
    $scope.currentPage = $scope.pageInfo.totalPages - 1;
    if ($scope.formData.targetname) {
      $scope.resetFormTaget();
    } else {
      $scope.getTargets();
    }
  };
  $scope.addOrUpdateItem = function () {
    // Hiển thị hộp thoại xác nhận bằng SweetAlert2
    Swal.fire({
      title: "Xác nhận",
      text: $scope.formData.id
        ? "Bạn có chắc chắn muốn cập nhật đối tượng sử dụng này?"
        : "Bạn có chắc chắn muốn thêm đối tượng sử dụng mới?",
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
            targetuser: $scope.formData.targetuser,
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
                  ? "Thêm đối tượng sử dụng thành công"
                  : "Cập nhật đối tượng sử dụng thành công");
              $scope.showNotification(message, "success");
              $scope.getTargets(); // Lấy lại danh sách đối tượng
              $scope.resetForm(); // Clear form after success
            },
            function (error) {
              $scope.showNotification(error.data.error, "error");
              $scope.getTargets();
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
            response.data.success || "Xóa đối tượng sử dụng thành công";
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
  $scope.resetFormTaget = function () {
    $scope.search(true);
  };
  $scope.search = function (resetPage = false) {
    if (resetPage) {
      $scope.currentPage = 0; // Đặt lại trang hiện tại về 0 nếu có yêu cầu
    }

    const searchQuery = $scope.formData.targetuser;
    if (!searchQuery || searchQuery.trim() === "") {
      $scope.showNotification(
        "Vui lòng nhập tên loại người dùng để tìm kiếm.",
        "error"
      );
      $scope.getTargets();
      return;
    }
    $http({
      method: "GET",
      url: `${API_BASE_URL}/getTargetusersearch?targetname=${searchQuery}&page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.pageInfo = response.data.page;
        $scope.targets = response.data.content;
        if ($scope.targets.length === 0) {
          $scope.showNotification(
            "Không tìm thấy loại người dùng nào phù hợp.",
            "warning"
          );
          $scope.getTargets();
          $scope.resetForm();
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tìm kiếm loại người dùng."
        );
        $scope.showNotification(errorMessage, "error");
        $scope.getTargets();
        $scope.resetForm();
      }
    );
  };

  $scope.getTargets();
});
