app.controller("VoucherController", function ($scope, $http, $location, socket) {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (userInfo) {
    socket.connect(userInfo);
  }
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://160.30.21.47:1234/api/Voucher";

  $scope.vouchers = [];
  $scope.deletedvouchers = [];
  $scope.formData = {};

  $scope.getVouchers = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.vouchers = response.data.filter(
          (voucher) => voucher.status === 1
        );
        console.log($scope.usages);
        $scope.deletedvouchers = response.data.filter(
          (voucher) => voucher.status === 0
        );
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
        usagecount: $scope.formData.usagecount,
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
              ? "Thêm voucher thành công"
              : "Cập nhật voucher thành công");
          $scope.showNotification(message, "success");
          $scope.getVouchers();
          $scope.resetForm(); // Clear form after success
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            method === "POST"
              ? "Không thể thêm voucher"
              : "Không thể cập nhật voucher"
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
          "Không thể tải dữ liệu voucher"
        );
        $scope.showNotification(errorMessage, "error");
      }
    );
  };

  $scope.getDeletedVouchers = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        $scope.deletedvouchers = response.data.filter(
          (voucher) => voucher.status === 0
        );
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách voucher đã xóa"
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

  $scope.getVouchers();
  $scope.getDeletedVouchers();
});
