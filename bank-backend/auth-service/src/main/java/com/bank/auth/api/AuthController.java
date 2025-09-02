package com.bank.auth.api;

import com.bank.auth.core.TokenStore;
import com.bank.auth.core.User;
import com.bank.auth.core.UserStore;
import com.bank.auth.dto.AuthResponse;
import com.bank.auth.dto.IntrospectResponse;
import com.bank.auth.dto.LoginRequest;
import com.bank.auth.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
// @CrossOrigin(origins = "${cors.allowed-origins:http://localhost:4200}")
@CrossOrigin(origins = {"http://localhost:8100", "http://localhost:4200"})
public class AuthController {

  private final UserStore userStore;
  private final TokenStore tokenStore;

  public AuthController(UserStore userStore, TokenStore tokenStore) {
    this.userStore = userStore;
    this.tokenStore = tokenStore;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
    if (userStore.exists(req.getEmail())) {
      return ResponseEntity.badRequest().body("User already exists");
    }
    User u = userStore.addUser(req.getEmail(), req.getPassword());
    String token = tokenStore.issue(u); // auto-login on register
    AuthResponse body = new AuthResponse(token, u.getEmail(), u.getRole());
    return ResponseEntity.status(200).body(body);
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
    Optional<User> found = userStore.findByEmail(req.getEmail());
    if (!found.isPresent() || !found.get().getPassword().equals(req.getPassword())) {
      return ResponseEntity.status(401).body("Invalid credentials");
    }
    User u = found.get();
    String token = tokenStore.issue(u);
    AuthResponse body = new AuthResponse(token, u.getEmail(), u.getRole());
    return ResponseEntity.status(200).body(body);
  }

  @GetMapping("/introspect")
  public ResponseEntity<?> introspect(@RequestParam String token) {
    Optional<User> u = tokenStore.introspect(token);
    if (!u.isPresent()) {
      return ResponseEntity.status(200).body(new IntrospectResponse(false, null, null));
    }
    User user = u.get();
    return ResponseEntity.status(200).body(new IntrospectResponse(true, user.getEmail(), user.getRole()));
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(@RequestHeader(name="Authorization", required=false) String auth) {
    if (auth != null && auth.startsWith("Bearer ")) {
      tokenStore.revoke(auth.substring(7));
    }
    return ResponseEntity.noContent().build();
  }
}
