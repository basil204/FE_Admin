app.controller("ContentController", function ($scope, $http) {
  const token = localStorage.getItem("authToken");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  $scope.contents = []; // Danh sách nội dung
  $scope.formData = {}; // Dữ liệu form
  $scope.search = {}; // Dữ liệu tìm kiếm
  $scope.notification = {}; // Thông báo

  const apiBaseUrl = "http://160.30.21.47:3000/api/data"; // Đường dẫn API CRUD
  const saveImgApiUrl = "http://160.30.21.47:3030/api/saveimg"; // Đường dẫn API lưu ảnh
  const API_BASE_URL = "http://160.30.21.47:1234/api";
  const imgbbApiKey = "588779c93c7187148b4fa9b7e9815da9"; // API Key của imgBB

  // Hàm hiển thị thông báo
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

  $scope.GetCustomers = function () {
    $http.get(`${API_BASE_URL}/user/lst`, config).then(
      function (response) {
        const validPhoneNumbers = response.data
          .filter((user) => user.role !== 3 && user.role !== 1) // Loại bỏ role = 3 và 1
          .map((user) => user.phonenumber)
          .filter((phone) => phone !== null); // Loại bỏ số điện thoại null

        // Loại bỏ số điện thoại trùng lặp
        const uniquePhoneNumbers = [...new Set(validPhoneNumbers)];

        $scope.info = uniquePhoneNumbers;
        $scope.customerCount = uniquePhoneNumbers.length; // Đếm số khách hàng
      },
      function (error) {
        $scope.showNotification("Không thể tải danh sách nhân viên", "error");
      }
    );
  };

  $scope.GetCustomers();

  $scope.saveImageData = function () {
    if (!$scope.formData.imgUrl || !$scope.formData.msg) {
      $scope.showNotification(
        "Vui lòng điền đầy đủ thông tin để lưu dữ liệu ảnh",
        "error"
      );
      return;
    }

    if (!$scope.info || $scope.info.length === 0) {
      $scope.showNotification(
        "Không có số điện thoại hợp lệ để lưu dữ liệu ảnh",
        "error"
      );
      return;
    }

    const sendImageDataWithDelay = function (index) {
      if (index >= $scope.info.length) {
        $scope.showNotification("Đã lưu dữ liệu ảnh thành công", "success");
        $scope.formData.msg = "";
        return;
      }

      const payload = {
        imagePath: $scope.formData.imgUrl,
        phone: $scope.info[index],
        msg: $scope.formData.msg,
      };

      $http
        .post(saveImgApiUrl, payload)
        .then(() => {
          $scope.showNotification(
            `Chương Trình Đã Gửi cho số điện thoại: ${$scope.info[index]}`,
            "success"
          );
        })
        .catch(() => {})
        .finally(() => {
          setTimeout(() => {
            sendImageDataWithDelay(index + 1);
          }, 5000);
        });
    };

    sendImageDataWithDelay(0);
  };

  $scope.loadContents = function () {
    $http
      .get(apiBaseUrl)
      .then((response) => {
        $scope.contents = response.data;
      })
      .catch(() => {
        $scope.showNotification("Không thể tải nội dung", "error");
      });
  };

  $scope.addOrUpdateItem = function () {
    if (
      !$scope.formData.name ||
      !$scope.formData.imgUrl ||
      !$scope.formData.selectBox2
    ) {
      $scope.showNotification("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    const payload = {
      name: $scope.formData.name,
      banner: $scope.formData.selectBox2,
      url: $scope.formData.imgUrl,
    };

    if ($scope.formData.id) {
      $http
        .put(`${apiBaseUrl}/${$scope.formData.id}`, payload)
        .then(() => {
          $scope.showNotification("Cập nhật nội dung thành công", "success");
          $scope.loadContents();
          $scope.formData = {};
        })
        .catch(() => {
          $scope.showNotification("Không thể cập nhật nội dung", "error");
        });
    } else {
      $http
        .post(apiBaseUrl, payload)
        .then(() => {
          $scope.showNotification("Thêm nội dung thành công", "success");
          $scope.loadContents();
          $scope.formData = {};
        })
        .catch(() => {
          $scope.showNotification("Không thể thêm nội dung", "error");
        });
    }
  };

  $scope.deleteItem = function (id) {
    if (confirm("Bạn có chắc muốn xóa nội dung này?")) {
      $http
        .delete(`${apiBaseUrl}/${id}`)
        .then(() => {
          $scope.showNotification("Xóa nội dung thành công", "success");
          $scope.loadContents();
        })
        .catch(() => {
          $scope.showNotification("Không thể xóa nội dung", "error");
        });
    }
  };

  $scope.editItem = function (item) {
    $scope.formData = angular.copy(item);
  };

  $scope.filterItems = function () {
    const filteredContents = $scope.contents.filter((item) => {
      const matchesName = $scope.search.name
        ? item.name.toLowerCase().includes($scope.search.name.toLowerCase())
        : true;
      const matchesBanner = $scope.search.banner
        ? item.banner === $scope.search.banner
        : true;
      return matchesName && matchesBanner;
    });
    $scope.filteredContents = filteredContents;
  };

  $scope.uploadImage = function (files) {
    if (!files || !files.length) {
      $scope.showNotification("Chưa chọn file ảnh", "error");
      return;
    }

    const selectedFile = files[0];
    const img = new Image();
    img.onload = function () {
      const validSizes = [
        { width: 1590, height: 200 },
        { width: 1590, height: 428 },
      ];

      const isValidSize = validSizes.some(
        (size) => img.width === size.width && img.height === size.height
      );

      if (!isValidSize) {
        $scope.$apply(() =>
          $scope.showNotification(
            "Kích thước ảnh không hợp lệ. Chỉ chấp nhận 1590x200px hoặc 1590x428px.",
            "error"
          )
        );
        return;
      }

      const uploadFormData = new FormData();
      uploadFormData.append("key", imgbbApiKey);
      uploadFormData.append("image", selectedFile);

      $http
        .post("https://api.imgbb.com/1/upload", uploadFormData, {
          headers: { "Content-Type": undefined },
          transformRequest: angular.identity,
        })
        .then((response) => {
          const imageUrl = response.data?.data?.url;
          if (imageUrl) {
            $scope.formData.imgUrl = imageUrl;
            $scope.showNotification("Tải ảnh lên thành công", "success");
          } else {
            $scope.showNotification("Không thể tải ảnh lên", "error");
          }
        })
        .catch(() => {
          $scope.showNotification("Không thể tải ảnh lên", "error");
        });
    };

    img.onerror = function () {
      $scope.$apply(() =>
        $scope.showNotification("Tệp ảnh không hợp lệ.", "error")
      );
    };

    img.src = URL.createObjectURL(selectedFile);
  };
  $scope.uploadImages = function (files) {
    if (!files || !files.length) {
      $scope.showNotification("Chưa chọn file ảnh", "error");
      return;
    }

    const selectedFile = files[0];
    const img = new Image();
    img.onload = function () {
      const uploadFormData = new FormData();
      uploadFormData.append("key", imgbbApiKey);
      uploadFormData.append("image", selectedFile);

      $http
        .post("https://api.imgbb.com/1/upload", uploadFormData, {
          headers: { "Content-Type": undefined },
          transformRequest: angular.identity,
        })
        .then((response) => {
          const imageUrl = response.data?.data?.url;
          if (imageUrl) {
            $scope.formData.imgUrl = imageUrl;
            $scope.showNotification("Tải ảnh lên thành công", "success");
          } else {
            $scope.showNotification("Không thể tải ảnh lên", "error");
          }
        })
        .catch(() => {
          $scope.showNotification("Không thể tải ảnh lên", "error");
        });
    };

    img.onerror = function () {
      $scope.$apply(() =>
        $scope.showNotification("Tệp ảnh không hợp lệ.", "error")
      );
    };

    img.src = URL.createObjectURL(selectedFile);
  };
  $scope.removeImage = function () {
    $scope.formData.imgUrl = "";
    $scope.showNotification("Xóa ảnh thành công", "success");
  };

  $scope.loadContents();
});
