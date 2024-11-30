var app = angular.module("myApp", ["ngRoute"]);

app.run(function ($rootScope, $location, socket) {
  const token = localStorage.getItem("authToken");

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
    if (userInfo) {
      socket.disconnect(userInfo);
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");

    $rootScope.isLoggedIn = false;
    $location.path("/login");
  };

  // Route access control
  $rootScope.$on("$routeChangeStart", function (event, next) {
    if (next.originalPath === "/login") {
      $rootScope.logout();
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
      ];

      const staffRoutes = [
        "/home",
        "/check-log-he-thong",
        "/form-add-don-hang",
        "/form-add-san-pham",
        "/table-data-khach-hang",
        "/table-data-oder",
        "/table-data-product",
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
    .when("/", { // Khi URL là trống
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
    .otherwise({
      redirectTo: "/home",
    });

  $locationProvider.html5Mode(true);
});
app.factory('socket', ['$q', function ($q) {
  var socket = null;
  var stompClient = null;

  return {
    connect: function (userInfo) {
      var deferred = $q.defer();
      socket = new SockJS('http://160.30.21.47:1234/api/u-websocket'); // URL WebSocket
      stompClient = Stomp.over(socket);

      stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        // Gửi thông điệp khi kết nối thành công để thông báo người dùng online
        stompClient.send('/app/connect', {}, JSON.stringify({
          userId: userInfo.id,
          role: userInfo.role,
          status: 'online' // Thông báo người dùng online
        }));
        deferred.resolve();
      }, function (error) {
        console.error('Error: ' + error);
        deferred.reject(error);
      });

      socket.onclose = function () {
        console.log("Socket closed. Attempting to reconnect...");
        setTimeout(() => {
          this.connect(userInfo); // Cố gắng kết nối lại sau một vài giây
        }, 5000);
      };

      return deferred.promise;
    },

    subscribe: function (destination, callback) {
      if (stompClient) {
        stompClient.subscribe(destination, function (message) {
          callback(message.body);
        });
      }
    },

    sendMessage: function (destination, message) {
      if (stompClient) {
        stompClient.send(destination, {}, JSON.stringify(message));
      }
    },

    disconnect: function (userInfo) {
      if (stompClient) {
        stompClient.send('/app/disconnect', {}, JSON.stringify({ userId: userInfo.id, role: userInfo.role }));
        stompClient.disconnect();
      }
    }
  };
}]);


app.run(['$window', 'socket', function ($window, socket) {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo) {
    return;
  }
  // Kết nối WebSocket khi người dùng đăng nhập
  socket.connect(userInfo);

  // Đảm bảo khi người dùng đóng trang, kết nối WebSocket bị đóng và ID bị xóa khỏi online users
  $window.onbeforeunload = function () {
    socket.disconnect(userInfo);
  };
}]);