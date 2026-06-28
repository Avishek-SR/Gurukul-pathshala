import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.security.Key;
import java.util.Base64;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class JwtTest {
    public static void main(String[] args) throws Exception {
        String secret = "dGhpcyBpcyBhIHNlY3JldCBrZXkgZm9yIGp3dCBzaWduaW5nIGFuZCB2ZXJpZmljYXRpb24gb2YgdG9rZW5zIQ==";
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        Key key = Keys.hmacShaKeyFor(keyBytes);
        
        String token = Jwts.builder()
                .setSubject("admin001")
                .claim("role", "ROLE_ADMIN")
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
                
        System.out.println("Generated Token: " + token);
        
        HttpClient client = HttpClient.newHttpClient();
        String reqBody = "{\"examDate\":\"10 Jan\", \"examVenue\":\"Hall A\", \"examNotes\":\"\"}";
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:8080/api/admin/admissions/applications/2/accept"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + token)
            .PUT(HttpRequest.BodyPublishers.ofString(reqBody))
            .build();
        
        HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
        System.out.println("Status: " + res.statusCode());
        System.out.println("Body: " + res.body());
    }
}
