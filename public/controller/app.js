var app = angular.module("myApp", ["ngRoute"]);
app.run(function ($rootScope, $location) {
  const token = localStorage.getItem("authToken");

  // Check if token exists and decode user info from token
  if (token) {
    const userInfo = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    $rootScope.isLoggedIn =
      userInfo.role === "Admin" || userInfo.role === "Staff";
    $rootScope.userRole = userInfo.role; // Save user role for access control

    if (!$rootScope.isLoggedIn) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
    }
  } else {
    $rootScope.isLoggedIn = false;
  }

  // Logout function
  $rootScope.logout = function () {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    $rootScope.stompClient.disconnect();
    $rootScope.isLoggedIn = false;
    $location.path("/login");
  };

  // Route access control
  $rootScope.$on("$routeChangeStart", function (event, next) {
    if (next.originalPath === "/login") {
      // Clear localStorage if route is login
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      $rootScope.isLoggedIn = false;
      $location.path("/login");
    } else if (next.originalPath === "/" || next.originalPath === "") {
      // If the URL is empty or root ("/"), redirect to /home
      $location.path("/home");
    } else if (next.resolve && !localStorage.getItem("authToken")) {
      $location.path("/login");
    } else if ($rootScope.isLoggedIn) {
      // Define allowed routes for each role
      const adminRoutes = [
        "/home",
        "/form-add-don-hang",
        "/form-add-nhan-vien",
        "/form-add-san-pham",
        "/quan-ly-bao-cao",
        "/table-data-khach-hang",
        "/table-data-oder",
        "/table-data-product",
        "/table-data-table",
        "/check-log-he-thong",
        "/invicedetail/:id",
        "/settings",
        "/duyen-don",
      ];

      const staffRoutes = [
        "/home",
        "/check-log-he-thong",
        "/form-add-don-hang",
        "/form-add-san-pham",
        "/table-data-khach-hang",
        "/table-data-oder",
        "/table-data-product",
        "/invicedetail/:id",
        "/settings",
        "/duyen-don",
      ];

      const userRoutes =
        $rootScope.userRole === "Admin" ? adminRoutes : staffRoutes;

      if (!userRoutes.includes(next.originalPath)) {
        Swal.fire({
          icon: "error",
          title: "Quyền truy cập bị từ chối",
          text: "Bạn không có quyền truy cập vào trang này.",
          confirmButtonText: "OK",
        }).then(() => {
          $rootScope.$apply(() => {
            $location.path("/home");
          });
        });
        event.preventDefault();
      }
    }
  });
});

app.config(function ($routeProvider, $locationProvider) {
  function requireAuth($location) {
    return function () {
      if (!localStorage.getItem("authToken")) {
        $location.path("/login");
      }
    };
  }

  $routeProvider
    .when("/", {
      // Khi URL là trống
      redirectTo: "/home", // Chuyển hướng đến /home
    })
    .when("/login", {
      templateUrl: "/views/login.html",
      controller: "LoginController",
    })
    .when("/home", {
      templateUrl: "/views/home.html",
      resolve: { auth: requireAuth },
    })
    .when("/invicedetail/:id", {
      templateUrl: "/views/ban-hang-tai-quay.html",
      resolve: { auth: requireAuth },
    })
    .when("/form-add-don-hang", {
      templateUrl: "/views/form-add-don-hang.html",
      resolve: { auth: requireAuth },
    })
    .when("/form-add-nhan-vien", {
      templateUrl: "/views/form-add-nhan-vien.html",
      resolve: { auth: requireAuth },
    })
    .when("/form-add-san-pham", {
      templateUrl: "/views/form-add-san-pham.html",
      resolve: { auth: requireAuth },
    })
    .when("/quan-ly-bao-cao", {
      templateUrl: "/views/quan-ly-bao-cao.html",
      resolve: { auth: requireAuth },
    })
    .when("/table-data-khach-hang", {
      templateUrl: "/views/table-data-khach-hang.html",
      resolve: { auth: requireAuth },
    })
    .when("/table-data-oder", {
      templateUrl: "/views/table-data-oder.html",
      resolve: { auth: requireAuth },
    })
    .when("/table-data-product", {
      templateUrl: "/views/table-data-product.html",
      resolve: { auth: requireAuth },
    })
    .when("/table-data-table", {
      templateUrl: "/views/table-data-table.html",
      resolve: { auth: requireAuth },
    })
    .when("/check-log-he-thong", {
      templateUrl: "/views/check-log-he-thong.html",
      resolve: { auth: requireAuth },
    })
    .when("/duyen-don", {
      templateUrl: "/views/DoiHang.html",
      resolve: { auth: requireAuth },
    })
    .when("/settings", {
      templateUrl: "/views/setting.html",
      resolve: { auth: requireAuth },
    })
    .otherwise({
      redirectTo: "/home",
    });

  $locationProvider.html5Mode(true);
});

app.run(function ($rootScope, $http, $location) {
  let socket = null;
  let stompClient = null;
  let isConnected = false;
  const Toast = Swal.mixin({
    toast: true,
    position: "top-right",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
  // Kết nối WebSocket tự động khi ứng dụng được khởi tạo
  function connectWebSocket() {
    if (isConnected) {
      return; // Nếu đã kết nối rồi thì không cần kết nối lại
    }

    const token = localStorage.getItem("authToken"); // Lấy token từ localStorage
    const socketUrl = `http://160.30.21.47:1234/api/ws?token=${encodeURIComponent(
      token
    )}`;

    socket = new SockJS(socketUrl); // Tạo kết nối SockJS
    stompClient = Stomp.over(socket); // Tạo đối tượng Stomp client

    stompClient.connect(
      {},
      function (frame) {
        isConnected = true;
        console.log("WebSocket connected: " + frame);

        // Đăng ký các subscriptions tại đây
        stompClient.subscribe("/topic/messages", function (message) {
          console.log("Received message: ", message.body);
          // Xử lý thông điệp ở đây (ví dụ: hiển thị Toast)
          Toast.fire({
            icon: "info",
            title: `Hóa đơn #${message.body} đã được đặt!`,
          });
        });
      },
      function (error) {
        console.error("Error: " + error);
      }
    );

    // Gắn stompClient vào $rootScope để sử dụng ở các controller khác
    $rootScope.stompClient = stompClient;
  }

  // Ngắt kết nối WebSocket
  function disconnectWebSocket() {
    if (stompClient) {
      stompClient.disconnect();
      isConnected = false;
      console.log("WebSocket disconnected");
    }
  }

  // Kết nối WebSocket khi ứng dụng được khởi tạo
  connectWebSocket();

  // Đảm bảo ngắt kết nối WebSocket khi ứng dụng bị hủy
  $rootScope.$on("$destroy", function () {
    disconnectWebSocket();
  });
});
