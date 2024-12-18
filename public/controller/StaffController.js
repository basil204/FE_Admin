app.controller("StaffController", function ($scope, $http, $location) {
  const token = localStorage.getItem("authToken");
  const API_BASE_URL = "http://160.30.21.47:1234/api";

  // Authorization Header
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const configs = {
    headers: {
      Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImE4YzU0OGZkYzk1ZjI5MDIzZjU1NWRlYjI5NWExYWNkZTViNDkzYjUyNTYzZTk5ZGY5ODliNjRkYmY2Zjc0Mjg5NzdjYWE2ODJiNWZkZTJlIn0.eyJhdWQiOiIxNjQiLCJqdGkiOiJhOGM1NDhmZGM5NWYyOTAyM2Y1NTVkZWIyOTVhMWFjZGU1YjQ5M2I1MjU2M2U5OWRmOTg5YjY0ZGJmNmY3NDI4OTc3Y2FhNjgyYjVmZGUyZSIsImlhdCI6MTczNDQyMjMyNiwibmJmIjoxNzM0NDIyMzI2LCJleHAiOjE3NjU5NTgzMjYsInN1YiI6IjM3ODAiLCJzY29wZXMiOltdfQ.hsWCVA6F3ucFnnRixAIk5nip_Le4gzLPh5QTPUEUj85v0mQ_ULeZXXbsUNDk54Y75uvED5Dq1nw-t2fzfHJez9yTwE4qF7bqnZuUrKItpfO2KQ-fultA4DYuIOSOe932rBd8IpTOu6BXQwTQ1lNvoe3lotNgApE-RUUA_on0qgU8WMcLrAhY3S0gZG4Ut12ptfkH5umnhhDZ2h1ZI41dSPt5hj4ZkugnGLVys_SXJ1Ik4JN2iKlGbyYdWz-qevw1zFgKaLC1_M-tpLZkHl2HI2UhEa7SeKIM7N3WeI-PksdcXaKqCJxNGBqixDrEo11x2ypleM4dm0MaH9jMcLsgU-J98-TGKcfxIdyiYCdwXXSv8m8sLA9WQvir6DTRu3GeYNI9P4562wyBbNk2zNAR7LbIg5g7Aeg3lmLmCvq6swZEAEkFFwD0Yi8wy-MYERaDkLCgbwBsZ4lLt_X4Lf3Yle453LI2IbmvWAm9ByCihKonU1Rir4n9qzGLjiY1fjdZMd9Au4KZXtAW4qtHh34K_5aKPIQh4tojv8qEsDyNUukDIbXzunvyul0iZ2wEfEaqOYjIt2uP-35DU7criR2hQFnS0ObMp9yKso7hGIvyTdE20YxUpuVwmj1L8Oumjl6mNvUIS89nJZwUC7-EsHHdtt442j96rSAg_T0LPYuDYkw`,
    },
  };
  $scope.currentPage = 0;
  $scope.pageSize = 5;
  $scope.formData = {};

  $scope.cities = [];
  $scope.districts = [];
  $scope.wards = [];
  $http
    .get("https://api.goship.io/api/v1/cities?limit=-1&sort=name:1", configs)
    .then(function (response) {
      if (response.data.status === "success") {
        $scope.cities = response.data.data;
      }
    });

  // Lấy danh sách quận khi chọn thành phố
  $scope.getDistricts = function () {
    if ($scope.city) {
      $http
        .get(
          `https://api.goship.io/api/v1/districts?city_code=${$scope.city}&limit=-1&sort=name:1`,
          configs
        )
        .then(function (response) {
          if (response.data.status === "success") {
            $scope.districts = response.data.data;
          }
        });
    }
  };

  // Lấy danh sách phường khi chọn quận
  $scope.getWards = function () {
    if ($scope.district) {
      $http
        .get(
          `https://api.goship.io/api/v1/wards?district_code=${$scope.district}&limit=-1&sort=name:1`,
          configs
        )
        .then(function (response) {
          if (response.data.status === "success") {
            $scope.wards = response.data.data;
          }
        });
    }
  };
  // Fetch staff list
  $scope.GetStaffs = function () {
    $http
      .get(
        `${API_BASE_URL}/user/Userpage?page=${$scope.currentPage}&size=${$scope.pageSize}`,
        config
      )
      .then(
        function (response) {
          console.log(response.data);
          $scope.pageInfo = response.data.page;
          $scope.staffs = response.data.content;
          console.log($scope.pageInfo);
          console.log($scope.staffs);
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tải danh sách nhân viên"
          );
          $scope.showNotification(errorMessage, "error");
        }
      );
  };

  $scope.nextPage = function () {
    if ($scope.currentPage < $scope.pageInfo.totalPages - 1) {
      $scope.currentPage++;
      if (
        $scope.filters &&
        ($scope.filters.email ||
          $scope.filters.fullname ||
          $scope.filters.username ||
          $scope.filters.address ||
          $scope.filters.phonenumber)
      ) {
        $scope.resetFormUser();
      } else {
        $scope.GetStaffs();
      }
    }
  };
  $scope.previousPage = function () {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
      if (
        $scope.filters &&
        ($scope.filters.email ||
          $scope.filters.fullname ||
          $scope.filters.username ||
          $scope.filters.address ||
          $scope.filters.phonenumber)
      ) {
        $scope.resetFormUser();
      } else {
        $scope.GetStaffs();
      }
    }
  };
  $scope.goToFirstPage = function () {
    $scope.currentPage = 0;
    if (
      $scope.filters &&
      ($scope.filters.email ||
        $scope.filters.fullname ||
        $scope.filters.username ||
        $scope.filters.address ||
        $scope.filters.phonenumber)
    ) {
      $scope.resetFormUser();
    } else {
      $scope.GetStaffs();
    }
  };
  $scope.goToLastPage = function () {
    $scope.currentPage = $scope.pageInfo.totalPages - 1;
    if (
      $scope.filters &&
      ($scope.filters.email ||
        $scope.filters.fullname ||
        $scope.filters.username ||
        $scope.filters.address ||
        $scope.filters.phonenumber)
    ) {
      $scope.resetFormUser();
    } else {
      $scope.GetStaffs();
    }
  };

  $scope.GetCustomers = function () {
    $http
      .get(
        `${API_BASE_URL}/user/Customerpage?page=${$scope.currentPage}&size=${$scope.pageSize}`,
        config
      )
      .then(
        function (response) {
          console.log(response.data);
          $scope.pageInfos = response.data.page;
          $scope.customers = response.data.content;
          console.log($scope.customers);
        },
        function (error) {
          const errorMessage = parseErrorMessages(
            error,
            "Không thể tải danh sách nhân viên"
          );
          $scope.showNotification(errorMessage, "error");
        }
      );
  };
  $scope.nextPageC = function () {
    if ($scope.currentPage < $scope.pageInfos.totalPages - 1) {
      $scope.currentPage++;
      if (
        $scope.filters &&
        ($scope.filters.email ||
          $scope.filters.fullname ||
          $scope.filters.username ||
          $scope.filters.address ||
          $scope.filters.phonenumber)
      ) {
        $scope.resetFormCustomer();
      } else {
        $scope.GetCustomers();
      }
    }
  };
  $scope.previousPageC = function () {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
      if (
        $scope.filters &&
        ($scope.filters.email ||
          $scope.filters.fullname ||
          $scope.filters.username ||
          $scope.filters.address ||
          $scope.filters.phonenumber)
      ) {
        $scope.resetFormCustomer();
      } else {
        $scope.GetCustomers();
      }
    }
  };
  $scope.goToFirstPageC = function () {
    $scope.currentPage = 0;
    if (
      $scope.filters &&
      ($scope.filters.email ||
        $scope.filters.fullname ||
        $scope.filters.username ||
        $scope.filters.address ||
        $scope.filters.phonenumber)
    ) {
      $scope.resetFormCustomer();
    } else {
      $scope.GetCustomers();
    }
  };
  $scope.goToLastPageC = function () {
    $scope.currentPage = $scope.pageInfos.totalPages - 1;
    if (
      $scope.filters &&
      ($scope.filters.email ||
        $scope.filters.fullname ||
        $scope.filters.username ||
        $scope.filters.address ||
        $scope.filters.phonenumber)
    ) {
      $scope.resetFormCustomer();
    } else {
      $scope.GetCustomers();
    }
  };

  $scope.deleteItem = function (id) {
    // Ask for confirmation before deleting
    Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn muốn thực hiện hành động này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with the deletion if confirmed
        $http({
          method: "DELETE",
          url: `${API_BASE_URL}/user/delete/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then(
          function (response) {
            const message =
              response.data.message || "Xóa người dùng thành công";
            $scope.showNotification(message, "success");
            $scope.GetCustomers();
            $scope.GetStaffs();
          },
          function (error) {
            const errorMessage = parseErrorMessages(
              error,
              "Không thể xóa người dùng"
            );
            $scope.showNotification(errorMessage, "error");
          }
        );
      }
    });
  };

  $scope.getItemById = function (id) {
    $http.get(`${API_BASE_URL}/user/lst/${id}`, config).then(
      function (response) {
        $scope.formData = response.data;
        console.log($scope.formData);
        $scope.formData.role = response.data.role.id;
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải dữ liệu người dùng"
        );
        $scope.showNotification(errorMessage, "error");
      }
    );
  };
  $scope.resetForm = function () {
    $scope.formData = {};
  };
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
  $scope.getRoles = function () {
    $http.get(`${API_BASE_URL}/role/lst`, config).then(
      function (response) {
        $scope.roles = response.data.filter((role) => role.id !== 1);
        console.log($scope.roles);
      },
      function (error) {
        const errorMessage = parseErrorMessages(
          error,
          "Không thể tải danh sách chức vụ"
        );
        $scope.showNotification(errorMessage, "error");
      }
    );
  };

  $scope.updateItem = function () {
    // Ask for confirmation before updating
    Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn muốn cập nhật tài khoản này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with the update if confirmed
        try {
          console.log($scope.formData);
          const url = `${API_BASE_URL}/user/update/${$scope.formData.id}`;
          const data = {
            fullname: $scope.formData.fullname,
            phonenumber: $scope.formData.phonenumber,
            address: $scope.formData.address,
            role: { id: $scope.formData.role },
          };

          $http({
            method: "PUT",
            url: url,
            data: data,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(
            function (response) {
              const message =
                response.data.message || "Cập nhật tài khoản thành công";
              $scope.showNotification(message, "success");
              $scope.GetCustomers();
              $scope.GetStaffs();
              $scope.resetForm(); // Clear form after success
            },
            function (error) {
              $scope.showNotification(error.data.error, "error");
              $scope.GetCustomers();
              $scope.GetStaffs();
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
      }
    });
  };

  $scope.resetFormUser = function () {
    $scope.searchUsers(true);
  };
  $scope.searchUsers = function (resetPage = false) {
    if (resetPage) {
      $scope.currentPage = 0; // Đặt lại trang hiện tại về 0 nếu có yêu cầu
    }
    let queryParams = [];

    if ($scope.search.phonenumber) {
      queryParams.push(`phonenumber=${$scope.search.phonenumber}`);
    }
    if ($scope.search.username) {
      queryParams.push(`username=${$scope.search.username}`);
    }
    if ($scope.search.fullname) {
      queryParams.push(`fullname=${$scope.search.fullname}`);
    }
    if ($scope.search.email) {
      queryParams.push(`email=${$scope.search.email}`);
    }
    if ($scope.search.address) {
      queryParams.push(`address=${$scope.search.address}`);
    }
    const currentPage = $scope.currentPage > 0 ? $scope.currentPage - 1 : 0; // API bắt đầu từ 0
    const pageSize = $scope.pageSize || 10; // Mặc định là 10 kết quả mỗi trang

    // Thêm tham số phân trang
    queryParams.push(`page=${currentPage}`);
    queryParams.push(`size=${pageSize}`);

    let queryString = queryParams.join("&");

    // Send the GET request with the query string parameters
    $http({
      method: "GET",
      url: `${API_BASE_URL}/user/Userpages?${queryString}&page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then(
      function (response) {
        const data = response.data;
        if (data && data.message && data.message.content) {
          $scope.staffs = data.message.content; // Lấy danh sách sản phẩm
          $scope.pageInfo = data.message.page; // Lấy thông tin phân trang
          console.log("Staffs loaded:", $scope.staffs);
        } else {
          console.error("Invalid API response structure:", data);
          $scope.staffs = []; // Không có dữ liệu
          $scope.pageInfo = null;
        }
      },
      function (error) {
        console.error("Error fetching milk details:", error);
        $scope.showNotification("Không thể tải người dùng", "error");
        $scope.resetForm();
      }
    );
  };

  $scope.resetFormCustomer = function () {
    $scope.searchCustomers(true);
  };
  $scope.searchCustomers = function (resetPage = false) {
    if (resetPage) {
      $scope.currentPage = 0; // Đặt lại trang hiện tại về 0 nếu có yêu cầu
    }
    let queryParams = [];

    if ($scope.search.phonenumber) {
      queryParams.push(`phonenumber=${$scope.search.phonenumber}`);
    }
    if ($scope.search.username) {
      queryParams.push(`username=${$scope.search.username}`);
    }
    if ($scope.search.fullname) {
      queryParams.push(`fullname=${$scope.search.fullname}`);
    }
    if ($scope.search.email) {
      queryParams.push(`email=${$scope.search.email}`);
    }
    if ($scope.search.address) {
      queryParams.push(`address=${$scope.search.address}`);
    }
    const currentPage = $scope.currentPage > 0 ? $scope.currentPage - 1 : 0; // API bắt đầu từ 0
    const pageSize = $scope.pageSize || 10; // Mặc định là 10 kết quả mỗi trang

    // Thêm tham số phân trang
    queryParams.push(`page=${currentPage}`);
    queryParams.push(`size=${pageSize}`);

    let queryString = queryParams.join("&");

    // Send the GET request with the query string parameters
    $http({
      method: "GET",
      url: `${API_BASE_URL}/user/Customerpages?${queryString}&page=${$scope.currentPage}&size=${$scope.pageSize}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then(
      function (response) {
        const data = response.data;
        if (data && data.message && data.message.content) {
          $scope.customers = data.message.content; // Lấy danh sách sản phẩm
          $scope.pageInfo = data.message.page; // Lấy thông tin phân trang
          console.log("Staffs loaded:", $scope.customers);
        } else {
          console.error("Invalid API response structure:", data);
          $scope.customers = []; // Không có dữ liệu
          $scope.pageInfo = null;
        }
      },
      function (error) {
        console.error("Error fetching milk details:", error);
        $scope.showNotification("Không thể tải người dùng", "error");
        $scope.resetForm();
      }
    );
  };
  $scope.GetCustomers();
  $scope.getRoles();
  $scope.GetStaffs();
});
