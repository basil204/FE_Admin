app.controller(
  "ProductController",
  function ($scope, $http, $location) {
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
          $scope.targets = response.data.filter(
            (target) => target.status === 1
          );
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
          $scope.deletedtypes = response.data.filter(
            (type) => type.status === 0
          );
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
    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.getProducts = function () {
      $http({
        method: "GET",
        url: `${API_BASE_URL}/Product/productPage?page=${$scope.currentPage}&size=${$scope.pageSize}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(
        function (response) {
          $scope.pageInfo = response.data.page;
          $scope.products = response.data.content;
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
    $scope.nextPage = function () {
      if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
        $scope.currentPage++;
        $scope.getProducts();
      }
    };

    $scope.previousPage = function () {
      if ($scope.currentPage > 0) {
        $scope.currentPage--;
        $scope.getProducts();
      }
    };

    $scope.goToFirstPage = function () {
      $scope.currentPage = 0;
      $scope.getProducts();
    };

    $scope.goToLastPage = function () {
      $scope.currentPage = $scope.pageInfo.totalPages - 1;
      $scope.getProducts();
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
      // Kiểm tra xem là cập nhật hay thêm mới
      const isUpdating = $scope.formData.id;

      // Hiển thị thông báo hỏi trước khi thực hiện hành động
      Swal.fire({
        title: isUpdating
          ? "Bạn có chắc chắn muốn cập nhật sản phẩm này?"
          : "Bạn có chắc chắn muốn thêm sản phẩm này?",
        text: "Các thay đổi sẽ được lưu và không thể hoàn tác.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Có, thực hiện!",
        cancelButtonText: "Hủy",
        reverseButtons: true,
      })
        .then((result) => {
          if (result.isConfirmed) {
            // Xây dựng cấu trúc dữ liệu để gửi lên server
            const productData = {
              productname: $scope.formData.productname,
              milkType: { id: $scope.formData.milkType },
              milkBrand: { id: $scope.formData.milkBrand },
              targetUser: { id: $scope.formData.targetUser },
              imgUrl: $scope.formData.imgUrl,
            };

            const apiUrl = isUpdating
              ? `${API_BASE_URL}/Product/update/${$scope.formData.id}` // Cập nhật sản phẩm
              : `${API_BASE_URL}/Product/add`; // Thêm mới sản phẩm

            const method = isUpdating ? "PUT" : "POST"; // Sử dụng PUT cho cập nhật, POST cho thêm mới

            // Gửi yêu cầu lên server
            $http({
              method: method,
              url: apiUrl,
              data: productData,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then(
                function (response) {
                  const successMessage = isUpdating
                    ? "Cập nhật sản phẩm thành công"
                    : "Thêm sản phẩm mới thành công";
                  $scope.showNotification(successMessage, "success");
                  $scope.resetForm(); // Reset form sau khi lưu
                  $scope.getProducts(); // Cập nhật lại danh sách sản phẩm

                  // Ẩn modal sau khi hoàn tất
                  $("#ModalProduct").modal("hide");
                },
                function (error) {
                  if (error.status === 400 && error.data && error.data.errors) {
                    // Lấy lỗi đầu tiên trong danh sách lỗi
                    const firstError = error.data.errors[0];
                    const errorMessage = ` ${firstError.message}`;
                    $scope.showNotification(errorMessage, "error");
                  } else {
                    const errorMessage = parseErrorMessages(
                      error,
                      method === "POST"
                        ? "Không thể thêm sản phẩm"
                        : "Không thể cập nhật sản phẩm"
                    );
                    $scope.showNotification(errorMessage, "error");
                  }
                }
              )
              .catch(function (exception) {
                // Xử lý lỗi không mong muốn
                console.error("Lỗi không mong muốn:", exception);
                $scope.showNotification(
                  "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
                  "error"
                );
              });
          } else {
            // Nếu người dùng chọn "Không", không làm gì cả
            console.log("Hành động đã bị hủy bỏ");
          }
        })
        .catch(function (exception) {
          // Xử lý lỗi không mong muốn của Swal
          console.error("Lỗi không mong muốn với Swal:", exception);
          $scope.showNotification(
            "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
            "error"
          );
        });
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
    $scope.deleteItem = function (id) {
      // Hiển thị thông báo hỏi trước khi xóa
      Swal.fire({
        title: "Bạn có chắc chắn muốn thực hiện hành động này không?",
        text: "Hành động này sẽ xóa vĩnh viễn đối tượng.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Có, xóa!",
        cancelButtonText: "Hủy",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          // Gửi yêu cầu DELETE nếu người dùng xác nhận
          $http({
            method: "DELETE",
            url: `${API_BASE_URL}/Product/delete/${id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(
            function (response) {
              const message =
                response.data.message || "Xóa đối tượng sử dụng thành công";
              $scope.showNotification(message, "success");
              $scope.getProducts(); // Làm mới danh sách sản phẩm
            },
            function (error) {
              const errorMessage = parseErrorMessages(
                error,
                "Không thể xóa đối tượng sử dụng"
              );
              $scope.showNotification(errorMessage, "error");
            }
          );
        } else {
          // Nếu người dùng hủy bỏ, không làm gì cả
          console.log("Hành động bị hủy.");
        }
      });
    };

    ClassicEditor.create(document.querySelector("#editor"), {
      toolbar: [
        "heading",
        "|",
        "bold",
        "italic",
        "link",
        "|",
        "bulletedList",
        "numberedList",
        "|",
        "outdent",
        "indent",
        "|",
        "blockQuote",
        "insertTable",
        "|",
        "undo",
        "redo",
        "|",
        "fontColor",
        "fontSize",
        "fontFamily",
        "|",
        "alignment",
        "horizontalLine",
        "|",
        "specialCharacters",
        "strikethrough",
      ],
      language: "vi", // Vietnamese language
    })
      .then((editor) => {
        // When CKEditor is ready, bind it to AngularJS model
        editor.model.document.on("change:data", () => {
          $scope.$apply(function () {
            $scope.editorContent = editor.getData();
            console.log($scope.editorContent);
          });
        });

        // Expose the editor to scope for further interaction
        $scope.editorInstance = editor;
      })
      .catch((error) => {
        console.error(error);
      });

    // Add any initial content or other logic
    $scope.editorContent = "";
    // Gọi các hàm lấy dữ liệu ban đầu
    $scope.getTargets();
    $scope.getBrands();
    $scope.getTypes();
    $scope.getProducts();
  }
);
