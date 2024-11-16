app.controller("ProductController", function ($scope, $http, $location) {
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://160.30.21.47:1234/api";

  $scope.targets = [];
  $scope.deletedtargets = [];
  $scope.formData = {};

  // Lấy danh sách đối tượng sử dụng
  $scope.getTargets = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Targetuser/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
        function (response) {
          $scope.targets = response.data.filter((target) => target.status === 1);
          $scope.deletedtargets = response.data.filter(
              (target) => target.status === 0
          );
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

  // Lấy danh sách thương hiệu
  $scope.brands = [];
  $scope.deletedBrands = [];
  $scope.getBrands = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Milkbrand/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
        function (response) {
          $scope.brands = response.data.filter((brand) => brand.status === 1);
          $scope.deletedBrands = response.data.filter(
              (brand) => brand.status === 0
          );
        },
        function (error) {
          const errorMessage = parseErrorMessages(
              error,
              "Không thể tải danh sách thương hiệu"
          );
          $scope.showNotification(errorMessage, "error");
        }
    );
  };

  // Lấy danh sách loại sữa
  $scope.types = [];
  $scope.deletedtypes = [];
  $scope.getTypes = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Milktype/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
        function (response) {
          $scope.types = response.data.filter((type) => type.status === 1);
          $scope.deletedtypes = response.data.filter((type) => type.status === 0);
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

  // Lấy danh sách sản phẩm
  $scope.products = [];
  $scope.deletedproducts = [];
  $scope.getProducts = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Product/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
        function (response) {
          $scope.products = response.data.filter(
              (product) => product.status === 1
          );
          $scope.deletedproducts = response.data.filter(
              (product) => product.status === 0
          );
        },
        function (error) {
          const errorMessage = parseErrorMessages(
              error,
              "Không thể tải danh sách sản phẩm"
          );
          $scope.showNotification(errorMessage, "error");
        }
    );
  };

  // Lấy thông tin sản phẩm theo ID
  $scope.getItemById = function (id) {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Product/lst/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
        function (response) {
          $scope.formData = response.data;
          $scope.formData.milkBrand = response.data.milkBrand.id;
          $scope.formData.milkType = response.data.milkType.id;
          $scope.formData.targetUser = response.data.targetUser.id;
        },
        function (error) {
          const errorMessage = parseErrorMessages(
              error,
              "Không thể tải dữ liệu sản phẩm"
          );
          $scope.showNotification(errorMessage, "error");
        }
    );
  };

  // Chức năng Thêm và Cập nhật Sản phẩm
  $scope.saveProduct = function () {
    const isUpdating = $scope.formData.id; // Kiểm tra xem là cập nhật hay thêm mới

    // Xây dựng cấu trúc dữ liệu để gửi lên server
    const productData = {
      productname: $scope.formData.productname,
      milkType: { id: $scope.formData.milkType },
      milkBrand: { id: $scope.formData.milkBrand },
      targetUser: { id: $scope.formData.targetUser },
      imgUrl: $scope.formData.imgUrl,
    };

    const apiUrl = isUpdating
        ? `${API_BASE_URL}/Product/update/${$scope.formData.id}`  // Cập nhật sản phẩm
        : `${API_BASE_URL}/Product/add`;  // Thêm mới sản phẩm

    const method = isUpdating ? "PUT" : "POST";  // Sử dụng PUT cho cập nhật, POST cho thêm mới

    // Gửi yêu cầu lên server
    $http({
      method: method,
      url: apiUrl,
      data: productData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
        function (response) {
          const successMessage = isUpdating
              ? "Cập nhật sản phẩm thành công"
              : "Thêm sản phẩm mới thành công";
          $scope.showNotification(successMessage, "success");
          $scope.resetForm(); // Reset form sau khi lưu
          $scope.getProducts(); // Cập nhật lại danh sách sản phẩm
        },
        function (error) {
          const errorMessage = parseErrorMessages(error, "Không thể lưu sản phẩm");
          $scope.showNotification(errorMessage, "error");
        }
    );
  };


  // Chức năng tải ảnh
  $scope.uploadImage = function (file) {
    const imgbbApiKey = "588779c93c7187148b4fa9b7e9815da9"; // API Key của imgBB

    if (!file) {
      return $scope.showNotification("No file selected", "error");
    }

    const formData = new FormData();
    formData.append("key", imgbbApiKey);
    formData.append("image", file[0]); // Đảm bảo bạn đang gửi đúng tệp ảnh

    $http
        .post("https://api.imgbb.com/1/upload", formData, {
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

  // Chức năng xóa ảnh
  $scope.removeImage = function () {
    $scope.formData.imgUrl = ""; // Xóa URL ảnh
    $scope.showNotification("Image removed successfully", "success");
  };

  // Reset form khi thêm hoặc sửa sản phẩm
  $scope.resetForm = function () {
    $scope.formData = {};
    $scope.formData.imgUrl = ""; // Reset ảnh khi reset form
  };

  // Hiển thị thông báo
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

  // Helper function để phân tích lỗi
  function parseErrorMessages(error, defaultMessage) {
    if (error.data && error.data.errors && Array.isArray(error.data.errors)) {
      return error.data.errors.map((err) => err.message).join("\n");
    }
    return defaultMessage;
  }

  // Gọi các hàm lấy dữ liệu ban đầu
  $scope.getTargets();
  $scope.getBrands();
  $scope.getTypes();
  $scope.getProducts();
});
