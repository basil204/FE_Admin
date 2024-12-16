app.controller("VoucherController", function ($scope, $http, $location) {
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://160.30.21.47:1234/api/Voucher";

  $scope.vouchers = [];
  $scope.deletedvouchers = [];
  $scope.formData = {};
  $scope.currentPage = 0;
  $scope.pageSize = 5;
  $scope.getVouchers = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/voucherPage?page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.pageInfo = response.data.page;
        $scope.vouchers = response.data.content;
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách voucher"
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
        ? "Bạn có chắc chắn muốn cập nhật voucher này?"
        : "Bạn có chắc chắn muốn thêm voucher mới?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    }).then((result) => {
      if (result.isConfirmed) {
        // Nếu người dùng chọn "Có", thực hiện thêm hoặc cập nhật voucher

        try {
          const method = $scope.formData.id ? "PUT" : "POST";
          const url = $scope.formData.id
            ? `${API_BASE_URL}/update/${$scope.formData.id}`
            : `${API_BASE_URL}/add`;

          const data = {
            vouchercode: $scope.formData.vouchercode,
            startdate: $scope.formData.startdate,
            enddate: $scope.formData.enddate,
            discountpercentage: $scope.formData.discountpercentage,
            maxamount: $scope.formData.maxamount,
            minamount: $scope.formData.minamount,
            usagecount: $scope.formData.usagecount,
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
                  ? "Thêm voucher thành công"
                  : "Cập nhật voucher thành công");
              $scope.showNotification(message, "success");
              $scope.getVouchers(); // Lấy lại danh sách voucher
              $scope.resetForm(); // Clear form after success
            },
            function (error) {
              $scope.showNotification(error.data.error, "error");
              $scope.getVouchers();
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
          const message = response.data.message || "Xóa voucher thành công";
          $scope.showNotification(message, "success");
          $scope.getVouchers();
          $scope.getDeletedVouchers();
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể xóa voucher"
          );
          $scope.showNotification(errorMessage, "error");
        }
      );
    }
  };

  $scope.getItemById = function (id) {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/getVoucherById/${id}`,
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
          "Không thể tải dữ liệu voucher"
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
  $scope.resetFormVoucher = function () {
    $scope.search(true);
  };
  $scope.search = function (resetPage = false) {
    if (resetPage) {
      $scope.currentPage = 0; // Đặt lại trang hiện tại về 0 nếu có yêu cầu
    }

    const searchQuery = $scope.formData.vouchercode;
    if (!searchQuery || searchQuery.trim() === "") {
      $scope.showNotification(
        "Vui lòng nhập voucher dùng để tìm kiếm.",
        "error"
      );
      $scope.getVouchers();
      return;
    }
    $http({
      method: "GET",
      url: `${API_BASE_URL}/getVouchersearch?vouchercode=${searchQuery}&page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.pageInfo = response.data.page;
        $scope.vouchers = response.data.content;
        if ($scope.vouchers.length === 0) {
          $scope.showNotification(
            "Không tìm thấy voucher nào phù hợp.",
            "warning"
          );
          $scope.getVouchers();
          $scope.resetForm();
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tìm kiếm voucher."
        );
        $scope.showNotification(errorMessage, "error");
        $scope.getVouchers();
        $scope.resetForm();
      }
    );
  };

  $scope.nextPage = function () {
    if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
      $scope.currentPage++;
      if ($scope.formData.vouchercode) {
        $scope.resetFormVoucher();
      } else {
        $scope.getVouchers();
      }
    }
  };
  $scope.previousPage = function () {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
      if ($scope.formData.vouchercode) {
        $scope.resetFormVoucher();
      } else {
        $scope.getVouchers();
      }
    }
  };
  $scope.goToFirstPage = function () {
    $scope.currentPage = 0;
    if ($scope.formData.vouchercode) {
      $scope.resetFormVoucher();
    } else {
      $scope.getVouchers();
    }
  };
  $scope.goToLastPage = function () {
    $scope.currentPage = $scope.pageInfo.totalPages - 1;
    if ($scope.formData.vouchercode) {
      $scope.resetFormVoucher();
    } else {
      $scope.getVouchers();
    }
  };

  $scope.getVouchers();
});
