import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class TestEndpoint {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        
        // Test accept directly without token, expect 401. If 404, mapping is broken!
        String reqBody = "{}";
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:8080/api/admin/admissions/applications/2/accept"))
            .header("Content-Type", "application/json")
            .PUT(HttpRequest.BodyPublishers.ofString(reqBody))
            .build();
        
        HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
        System.out.println("Accept Response Code: " + res.statusCode());
        System.out.println(res.body());
    }
}
