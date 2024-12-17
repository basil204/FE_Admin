app.controller("UsagecapacityController", function ($scope, $http, $location) {
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://localhost:1234/api/Usagecapacity";

  $scope.usages = [];
  $scope.formData = {};
  $scope.currentPage = 0;
  $scope.pageSize = 5;
  $scope.getUsages = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/getUsagecapacityPage?page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.pageInfo = response.data.page;
        $scope.usages = response.data.content;
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách đơn vị đóng gói"
        );
        $scope.showNotification(errorMessage, "error");
      }
    );
  };

  $scope.addOrUpdateItem = function () {
    if (
      !Number.isInteger($scope.formData.capacity) ||
      $scope.formData.capacity <= 0
    ) {
      $scope.showNotification("Sức chứa phải là một số nguyên dương.", "error");
      return; // Dừng thực hiện nếu giá trị không hợp lệ
    }
    // Hiển thị hộp thoại xác nhận bằng SweetAlert2
    Swal.fire({
      title: "Xác nhận",
      text: $scope.formData.id
        ? "Bạn có chắc chắn muốn cập nhật đơn vị đóng gói này?"
        : "Bạn có chắc chắn muốn thêm đơn vị đóng gói mới?",
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
            capacity: $scope.formData.capacity,
            unit: $scope.formData.unit,
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
                  ? "Thêm đơn vị đóng gói thành công"
                  : "Cập nhật đơn vị đóng gói thành công");
              $scope.showNotification(message, "success");
              $scope.getUsages(); // Lấy lại danh sách đơn vị đóng gói
              $scope.resetForm(); // Clear form after success
            },
            function (error) {
              $scope.showNotification(error.data.error, "error");
              $scope.getUsages();
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
            response.data.message || "Xóa đơn vị đóng gói thành công";
          $scope.showNotification(message, "success");
          $scope.getUsages();
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể xóa đơn vị đóng gói"
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
          "Không thể tải dữ liệu đơn vị đóng gói"
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

  $scope.resetFormUsage = function () {
    $scope.search(true);
  };
  $scope.search = function (resetPage = false) {
    if (resetPage) {
      $scope.currentPage = 0; // Đặt lại trang hiện tại về 0 nếu có yêu cầu
    }

    const searchQuery = $scope.formDatas.capacity;
    if (!searchQuery || searchQuery.trim() === "") {
      $scope.showNotification(
        "Vui lòng nhập tên công xuất sử dụng  để tìm kiếm.",
        "error"
      );
      $scope.getUsages();
      return;
    }
    $http({
      method: "GET",
      url: `${API_BASE_URL}/getUsagecapacityPageByCapacity?capacity=${searchQuery}&page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.pageInfo = response.data.page;
        $scope.usages = response.data.content;
        if ($scope.usages.length === 0) {
          $scope.showNotification(
            "Không tìm thấy công xuất sử dụng nào phù hợp.",
            "warning"
          );
          $scope.getUsages();
          $scope.resetForm();
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tìm kiếm công xuất sử dụng."
        );
        $scope.showNotification(errorMessage, "error");
        $scope.getUsages();
        $scope.resetForm();
      }
    );
  };

  $scope.nextPage = function () {
    if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
      $scope.currentPage++;
      if ($scope.formData.capacity) {
        $scope.resetFormUsage();
      } else {
        $scope.getUsages();
      }
    }
  };
  $scope.previousPage = function () {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
      if ($scope.formData.capacity) {
        $scope.resetFormUsage();
      } else {
        $scope.getUsages();
      }
    }
  };
  $scope.goToFirstPage = function () {
    $scope.currentPage = 0;
    if ($scope.formData.capacity) {
      $scope.resetFormUsage();
    } else {
      $scope.getUsages();
    }
  };
  $scope.goToLastPage = function () {
    $scope.currentPage = $scope.pageInfo.totalPages - 1;
    if ($scope.formData.capacity) {
      $scope.resetFormUsage();
    } else {
      $scope.getUsages();
    }
  };

  $scope.getUsages();
});
