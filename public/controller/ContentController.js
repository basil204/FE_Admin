app.controller("ContentController", function ($scope, $http) {
  $scope.contents = []; // Danh sách nội dung
  $scope.formData = {}; // Dữ liệu form
  $scope.search = {}; // Dữ liệu tìm kiếm
  $scope.notification = {}; // Thông báo

  const apiBaseUrl = "http://localhost:3004/api/data"; // Đường dẫn API CRUD
  const imgbbApiKey = "588779c93c7187148b4fa9b7e9815da9"; // API Key của imgBB

  // Hàm hiển thị thông báo
  $scope.showNotification = function (message, type) {
    $scope.notification.message = message;
    $scope.notification.type = type;
    setTimeout(() => {
      $scope.notification.message = null;
      $scope.$apply(); // Đảm bảo cập nhật giao diện
    }, 3000);
  };

  // Lấy danh sách nội dung từ API
  $scope.loadContents = function () {
    $http
      .get(apiBaseUrl)
      .then((response) => {
        $scope.contents = response.data;
      })
      .catch(() => {
        $scope.showNotification("Failed to load contents", "error");
      });
  };

  // Thêm hoặc cập nhật nội dung
  $scope.addOrUpdateItem = function () {
    if (
      !$scope.formData.name ||
      !$scope.formData.imgUrl ||
      !$scope.formData.selectBox2
    ) {
      $scope.showNotification("Please fill in all required fields", "error");
      return;
    }

    const payload = {
      name: $scope.formData.name,
      banner: $scope.formData.selectBox2, // Kiểu banner
      url: $scope.formData.imgUrl, // URL ảnh từ Imgur
    };

    if ($scope.formData.id) {
      // Cập nhật
      $http
        .put(`${apiBaseUrl}/${$scope.formData.id}`, payload)
        .then(() => {
          $scope.showNotification("Content updated successfully", "success");
          $scope.loadContents();
          $scope.formData = {};
        })
        .catch(() => {
          $scope.showNotification("Failed to update content", "error");
        });
    } else {
      // Thêm mới
      $http
        .post(apiBaseUrl, payload)
        .then(() => {
          $scope.showNotification("Content added successfully", "success");
          $scope.loadContents();
          $scope.formData = {};
        })
        .catch(() => {
          $scope.showNotification("Failed to add content", "error");
        });
    }
  };

  // Xóa nội dung
  $scope.deleteItem = function (id) {
    if (confirm("Bạn có chắc muốn xóa nội dung này?")) {
      $http
        .delete(`${apiBaseUrl}/${id}`)
        .then(() => {
          $scope.showNotification("Content deleted successfully", "success");
          $scope.loadContents();
        })
        .catch(() => {
          $scope.showNotification("Failed to delete content", "error");
        });
    }
  };

  // Sửa nội dung
  $scope.editItem = function (item) {
    $scope.formData = angular.copy(item);
  };

  // Tìm kiếm nội dung
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

  // Upload ảnh lên Imgur
  $scope.uploadImage = function (files) {
    if (!files || !files.length) {
      $scope.showNotification("No file selected", "error");
      return;
    }

    const selectedFile = files[0];
    const formData = new FormData();
    formData.append("image", selectedFile);

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
            "Invalid image dimensions. Only 1590x200px or 1590x482px are allowed.",
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
            $scope.formData.imgUrl = imageUrl; // Cập nhật URL ảnh vào formData
            $scope.showNotification("Image uploaded successfully", "success");
          } else {
            $scope.showNotification("Failed to upload image", "error");
          }
        })
        .catch((error) => {
          $scope.showNotification("Failed to upload image", "error");
        });
    };

    img.onerror = function () {
      $scope.$apply(() =>
        $scope.showNotification("Invalid image file.", "error")
      );
    };

    img.src = URL.createObjectURL(selectedFile);
  };

  // Xóa ảnh
  $scope.removeImage = function () {
    $scope.formData.imgUrl = "";
    $scope.showNotification("Image removed successfully", "success");
  };

  // Tải danh sách nội dung khi khởi tạo
  $scope.loadContents();
});
