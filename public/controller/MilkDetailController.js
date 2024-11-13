app.controller("MilkDetailController", function ($scope, $http, $location) {
  // Notification Setup
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://160.30.21.47:1234/api";

  if (!token) {
    showNotification(
      "Authentication token is missing. Please log in.",
      "error"
    );
    return;
  }

  // Function to show notifications
  function showNotification(message, type) {
    Swal.fire({
      title: type === "success" ? "Thành công!" : "Lỗi!",
      text: message,
      icon: type,
      confirmButtonText: "OK",
      timer: 3000,
      timerProgressBar: true,
    });
  }

  // Helper function to handle errors
  function parseErrorMessages(error, defaultMessage) {
    if (error && error.data && error.data.message) {
      return error.data.message;
    }
    return defaultMessage;
  }

  // Pagination parameters
  $scope.currentPage = 0;
  $scope.pageSize = 5;
  $scope.formData = {}; // Initialize formData to an empty object

  // Function to reset formData
  $scope.resetForm = function () {
    $scope.formData = {};
  };
  $scope.uploadImage = function (files) {
    const imgbbApiKey = "588779c93c7187148b4fa9b7e9815da9";
    const file = files[0];

    if (!file) {
      // console.log("No file selected for upload"); // Log no file selection
      return $scope.showNotification("No file selected", "error");
    }

    const formData = new FormData();
    formData.append("key", imgbbApiKey);
    formData.append("image", file);

    $http
      .post("https://api.imgbb.com/1/upload", formData, {
        headers: { "Content-Type": undefined },
        transformRequest: angular.identity,
      })
      .then((response) => {
        const imageUrl = response.data?.data?.url;
        if (imageUrl) {
          $scope.formData.imgUrl = imageUrl;
          $scope.showNotification("Image uploaded successfully", "success");
          // console.log("Image uploaded successfully:", imageUrl); // Log successful upload
        } else {
          $scope.showNotification("Failed to upload image", "error");
        }
      })
      .catch((error) => handleApiError("Failed to upload image", error));
  };
  $scope.getProducts = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Product/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        if (response.data && Array.isArray(response.data)) {
          $scope.products = response.data;
          console.log($scope.products);
        } else {
          showNotification(
            "Định dạng dữ liệu nhận được không như mong đợi.",
            "error"
          );
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách Product. Vui lòng thử lại sau."
        );
        showNotification(errorMessage, "error");
      }
    );
  };

  $scope.getMilktastes = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Milktaste/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        if (response.data && Array.isArray(response.data)) {
          $scope.milktastes = response.data;
          console.log($scope.milktastes);
        } else {
          showNotification(
            "Định dạng dữ liệu nhận được không như mong đợi.",
            "error"
          );
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách milktaste. Vui lòng thử lại sau."
        );
        showNotification(errorMessage, "error");
      }
    );
  };

  $scope.getPackagingunits = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Packagingunit/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        if (response.data && Array.isArray(response.data)) {
          $scope.packagingunits = response.data;
          console.log($scope.packagingunits);
        } else {
          showNotification(
            "Định dạng dữ liệu nhận được không như mong đợi.",
            "error"
          );
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách packagingunit. Vui lòng thử lại sau."
        );
        showNotification(errorMessage, "error");
      }
    );
  };

  $scope.getUsagecapacitys = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Usagecapacity/lst`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        if (response.data && Array.isArray(response.data)) {
          $scope.usagecapacitys = response.data;
          console.log($scope.usagecapacitys);
        } else {
          showNotification(
            "Định dạng dữ liệu nhận được không như mong đợi.",
            "error"
          );
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách usagecapacitys. Vui lòng thử lại sau."
        );
        showNotification(errorMessage, "error");
      }
    );
  };

  $scope.getMilkdetails = function () {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Milkdetail/getMilkDetailPage?page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        const data = response.data;
        $scope.pageInfo = data.message.page;

        if (data.status === "success" && data.message && data.message.content) {
          $scope.Milkdetails = data.message.content;
          $scope.deletedMilkdetails = data.message.content.filter(
            (milkdetail) => milkdetail.status === 0
          );
        } else {
          showNotification("Unexpected data format received.", "error");
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Cannot load Milkdetail list. Please try again later."
        );
        showNotification(errorMessage, "error");
      }
    );
  };
  $scope.saveMilkdetail = function (formData) {
    const isUpdate = !!formData.id;
    const url = `${API_BASE_URL}/Milkdetail/${
      isUpdate ? "update/" + formData.id : "add"
    }`;
    const method = isUpdate ? "PUT" : "POST";

    const datas = {
      product: { id: formData.product },
      milkTaste: { id: formData.milkTaste },
      packagingunit: { id: formData.packagingunit },
      usageCapacity: { id: formData.usageCapacity },
      description: formData.description,
      shelflifeofmilk: formData.shelflifeofmilk,
      price: formData.price,
      imgUrl: formData.imgUrl,
      stockquantity: formData.stockquantity,
    };

    $http({
      method: method,
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: datas,
    }).then(
      function (response) {
        if (response.status === 200) {
          showNotification(
            isUpdate
              ? "Milkdetail updated successfully."
              : "Milkdetail added successfully.",
            "success"
          );
          $scope.getMilkdetails(); // Refresh the list
          $scope.resetForm(); // Clear the form data
          $("#ModalUP").modal("hide"); // Đóng MODAL khi thành công
        } else {
          showNotification(
            isUpdate
              ? "Failed to update Milkdetail."
              : "Failed to add Milkdetail.",
            "error"
          );
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          isUpdate
            ? "Could not update Milkdetail. Please try again later."
            : "Could not add Milkdetail. Please try again later."
        );
        showNotification(errorMessage, "error");
      }
    );
  };

  $scope.getMilkdetailById = function (id) {
    $http({
      method: "GET",
      url: `${API_BASE_URL}/Milkdetail/lst/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(
      function (response) {
        if (response.status === 200) {
          $scope.formData = response.data;
          $scope.formData.milkTaste = response.data.milkTaste.id;
          $scope.formData.packagingunit = response.data.packagingunit.id;
          $scope.formData.usageCapacity = response.data.usageCapacity.id;
          $scope.formData.product = response.data.product.id;
        } else {
          showNotification("Milkdetail not found.", "error");
        }
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Could not retrieve Milkdetail data. Please try again later."
        );
        showNotification(errorMessage, "error");
      }
    );
  };

  // Pagination controls
  $scope.nextPage = function () {
    if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
      $scope.currentPage++;
      $scope.getMilkdetails();
    }
  };

  $scope.previousPage = function () {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
      $scope.getMilkdetails();
    }
  };

  $scope.goToFirstPage = function () {
    $scope.currentPage = 0;
    $scope.getMilkdetails();
  };

  $scope.goToLastPage = function () {
    $scope.currentPage = $scope.pageInfo.totalPages - 1;
    $scope.getMilkdetails();
  };

  // Load initial data
  $scope.getProducts();
  $scope.getMilktastes();
  $scope.getPackagingunits();
  $scope.getUsagecapacitys();
  $scope.getMilkdetails();
});
