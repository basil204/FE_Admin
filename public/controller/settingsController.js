app.controller(
  "settingsController",
  function ($scope, $http, $location, socket) {
    const token = localStorage.getItem("authToken");
    const API_BASE_URL = "http://localhost:1234/api";

    // Available banks
    $scope.availableBanks = [
      { code: "970415", name: "VietinBank" },
      { code: "970436", name: "Vietcombank" },
      { code: "970418", name: "BIDV" },
      { code: "970405", name: "Agribank" },
      { code: "970448", name: "OCB" },
      { code: "970422", name: "MBBank" },
      { code: "970407", name: "Techcombank" },
      { code: "970416", name: "ACB" },
      { code: "970432", name: "VPBank" },
      { code: "970423", name: "TPBank" },
      { code: "970403", name: "Sacombank" },
      { code: "970437", name: "HDBank" },
      { code: "970454", name: "VietCapitalBank" },
      { code: "970429", name: "SCB" },
      { code: "970441", name: "VIB" },
      { code: "970443", name: "SHB" },
      { code: "970431", name: "Eximbank" },
      { code: "970426", name: "MSB" },
      { code: "546034", name: "CAKE" },
      { code: "546035", name: "Ubank" },
      { code: "963388", name: "Timo" },
      { code: "971005", name: "ViettelMoney" },
      { code: "971011", name: "VNPTMoney" },
      { code: "970400", name: "SaigonBank" },
      { code: "970409", name: "BacABank" },
      { code: "970412", name: "PVcomBank" },
      { code: "970414", name: "Oceanbank" },
      { code: "970419", name: "NCB" },
      { code: "970424", name: "ShinhanBank" },
      { code: "970425", name: "ABBANK" },
      { code: "970427", name: "VietABank" },
      { code: "970428", name: "NamABank" },
      { code: "970430", name: "PGBank" },
      { code: "970433", name: "VietBank" },
      { code: "970438", name: "BaoVietBank" },
      { code: "970440", name: "SeABank" },
      { code: "970446", name: "COOPBANK" },
      { code: "970449", name: "LPBank" },
      { code: "970452", name: "KienLongBank" },
      { code: "668888", name: "KBank" },
      { code: "970462", name: "KookminHN" },
      { code: "970466", name: "KEBHanaHCM" },
      { code: "970467", name: "KEBHANAHN" },
      { code: "977777", name: "MAFC" },
      { code: "533948", name: "Citibank" },
      { code: "970463", name: "KookminHCM" },
      { code: "999888", name: "VBSP" },
      { code: "970457", name: "Woori" },
      { code: "970421", name: "VRB" },
      { code: "970458", name: "UnitedOverseas" },
      { code: "970410", name: "StandardChartered" },
      { code: "970439", name: "PublicBank" },
      { code: "801011", name: "Nonghyup" },
      { code: "970434", name: "IndovinaBank" },
      { code: "970456", name: "IBKHCM" },
      { code: "970455", name: "IBKHN" },
      { code: "458761", name: "HSBC" },
      { code: "970442", name: "HongLeong" },
      { code: "970408", name: "GPBank" },
      { code: "970406", name: "DongABank" },
      { code: "796500", name: "DBSBank" },
      { code: "422589", name: "CIMB" },
      { code: "970444", name: "CBBank" },
    ];

    // Default settings object
    $scope.settings = {
      logo: "",
      nameshop: "",
      apikey: "",
      valuebank: "",
      stk: "",
      hotline: "",
      fullname: "",
      email: "",
      address: "",
    };

    // Function to upload the image to imgBB
    $scope.uploadImage = function (files) {
      const imgbbApiKey = "588779c93c7187148b4fa9b7e9815da9"; // imgBB API key

      if (!files || !files.length) {
        return $scope.showNotification("No file selected", "error");
      }

      const formData = new FormData();
      formData.append("key", imgbbApiKey);
      formData.append("image", files[0]); // Attach the file

      $http
        .post("https://api.imgbb.com/1/upload", formData, {
          headers: { "Content-Type": undefined },
          transformRequest: angular.identity,
        })
        .then((response) => {
          const imageUrl = response.data?.data?.url; // Get image URL from response

          if (imageUrl) {
            $scope.settings.logo = imageUrl; // Assign the image URL to settings.logo
            $scope.settings.imgUrl = imageUrl; // This will be used for previewing the uploaded image
            $scope.showNotification("Image uploaded successfully", "success");
          } else {
            $scope.showNotification("Failed to upload image", "error");
          }
        })
        .catch((error) => {
          $scope.showNotification("Failed to upload image", "error");
        });
    };

    // Function to remove the uploaded image
    $scope.removeImage = function () {
      $scope.settings.logo = ""; // Clear the logo URL
      $scope.settings.imgUrl = ""; // Clear the image preview URL
      $scope.showNotification("Image removed successfully", "success");
    };

    // Function to show notifications
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

    // Function to save the settings (send data to backend)
    $scope.saveSettings = function () {
      // Kiểm tra xem tất cả các trường bắt buộc có được điền đầy đủ không
      if (
        !$scope.settings.logo ||
        !$scope.settings.nameshop ||
        !$scope.settings.apikey ||
        !$scope.settings.valuebank ||
        !$scope.settings.stk ||
        !$scope.settings.hotline ||
        !$scope.settings.fullname ||
        !$scope.settings.email ||
        !$scope.settings.address
      ) {
        // Hiển thị thông báo lỗi nếu có trường không hợp lệ
        $scope.showNotification(
          "Vui lòng điền đầy đủ tất cả các thông tin cài đặt.",
          "error"
        );
        return; // Dừng lại nếu có trường không hợp lệ
      }

      // Kiểm tra định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!$scope.settings.email.match(emailRegex)) {
        // Hiển thị thông báo lỗi nếu email không hợp lệ
        $scope.showNotification(
          "Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.",
          "error"
        );
        return;
      }

      // Hiển thị thông báo hỏi trước khi lưu cài đặt
      Swal.fire({
        title: "Bạn có chắc chắn muốn lưu các cài đặt này không?",
        text: "Hành động này sẽ lưu các thay đổi của bạn.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Có, lưu!",
        cancelButtonText: "Hủy",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          // Dữ liệu cài đặt cần lưu
          const data = {
            logo: $scope.settings.logo,
            nameshop: $scope.settings.nameshop,
            apikey: $scope.settings.apikey,
            valuebank: $scope.settings.valuebank,
            stk: $scope.settings.stk,
            hotline: $scope.settings.hotline,
            fullname: $scope.settings.fullname,
            email: $scope.settings.email,
            address: $scope.settings.address,
          };

          // Gửi yêu cầu lưu cài đặt lên server
          $http
            .post(API_BASE_URL + "/Setting/update", data, {
              headers: {
                Authorization: "Bearer " + token, // Include the token if needed
              },
            })
            .then(function (response) {
              // Success callback
              console.log("Settings updated successfully", response.data);
              $scope.showNotification(
                "Cài đặt đã được lưu thành công.",
                "success"
              );
            })
            .catch(function (error) {
              // Error callback
              console.error("Error updating settings", error);
              $scope.showNotification(
                "Đã có lỗi xảy ra khi lưu cài đặt.",
                "error"
              );
            });
        } else {
          // Nếu người dùng hủy bỏ, không làm gì cả
          console.log("Hành động bị hủy.");
        }
      });
    };

    // Function to get settings from the backend (if needed)
    $scope.getSettings = function () {
      const config = {
        headers: {
          Authorization: "Bearer " + token,
        },
        params: {
          id: $scope.settings.id,
        },
      };

      $http
        .get(API_BASE_URL + "/Setting/get", config)
        .then(function (response) {
          // Success callback
          console.log("Settings retrieved successfully", response.data);
          $scope.settings = response.data;

          // Ensure the image URL is properly set for display
          if ($scope.settings.logo) {
            $scope.settings.imgUrl = $scope.settings.logo;
          }
        })
        .catch(function (error) {
          // Error callback
          console.error("Error fetching settings", error);
          $scope.showNotification("Đã có lỗi xảy ra khi lấy cài đặt.", "error");
        });
    };

    // Call the getSettings and getAvailableBanks functions when the controller loads
    $scope.getSettings();

    // Function to reset the form to initial state
    $scope.resetForm = function () {
      $scope.settings = {
        logo: "",
        nameshop: "",
        apikey: "",
        valuebank: "",
        stk: "",
        hotline: "",
        fullname: "",
        email: "",
        address: "",
      };
    };
  }
);
