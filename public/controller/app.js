var app = angular.module("myApp", ["ngRoute"]);
app.run([
  "$rootScope",
  "$location",
  function ($rootScope, $location) {
    // Kiểm tra nếu người dùng đang ở trang '/ban-hang-tai-quay'
    $rootScope.isBanHangTaiQuayPage = $location.path() === "/ban-hang-tai-quay";

    // Lắng nghe sự thay đổi của route để cập nhật trạng thái của isBanHangTaiQuayPage
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
      // Kiểm tra nếu URL thay đổi và cập nhật trạng thái
      $rootScope.isBanHangTaiQuayPage =
        $location.path() === "/ban-hang-tai-quay";
    });
  },
]);
app.run(function ($rootScope, $location, socket) {
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
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    socket.disconnect();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");

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
        "/ban-hang-tai-quay",
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
        "/ban-hang-tai-quay",
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
    .when("/ban-hang-tai-quay", {
      templateUrl: "/views/ban-hang-tai-quay.html",
      controller: "BanHangTaiQuayController",
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

app.factory("socket", [
  "$q",
  function ($q) {
    var socket = null;
    var stompClient = null;
    var subscriptions = {}; // Khai báo biến subscriptions để lưu danh sách topic đã subscribe
    var isConnected = false;
    return {
      connect: function () {
        var deferred = $q.defer();
        var token = localStorage.getItem("authToken");
        var socketUrl =
          "http://localhost:1234/api/ws?token=" + encodeURIComponent(token);

        socket = new SockJS(socketUrl);
        stompClient = Stomp.over(socket);

        // Kết nối với Stomp server
        stompClient.connect(
          {},
          function (frame) {
            console.log("Connected: " + frame);
            isConnected = true;
            deferred.resolve();
          },
          function (error) {
            console.error("Error: " + error);
            isConnected = false;
            deferred.reject(error);
          }
        );

        return deferred.promise;
      },

      subscribe: function (destination, callback) {
        if (stompClient) {
          if (!subscriptions[destination]) {
            subscriptions[destination] = stompClient.subscribe(
              destination,
              function (response) {
                callback(JSON.parse(response.body));
              }
            );
          }
        } else {
          console.error("Stomp client is not connected!");
        }
      },

      sendMessage: function (destination, message) {
        if (stompClient) {
          stompClient.send(destination, {}, JSON.stringify(message));
        }
      },

      disconnect: function () {
        if (stompClient) {
          stompClient.disconnect();
          stompClient = null;
          subscriptions = {}; // Xóa danh sách subscriptions
          isConnected = false;
        }
      },
    };
  },
]);
