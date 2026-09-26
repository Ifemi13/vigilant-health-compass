package com.vigilanthealth.compass.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.ECDSASigner;
import com.nimbusds.jose.jwk.Curve;
import com.nimbusds.jose.jwk.ECKey;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.gen.ECKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.sun.net.httpserver.HttpServer;
import com.vigilanthealth.compass.TestcontainersConfiguration;

/**
 * Validates real signed tokens shaped like Supabase Auth's (ES256, JWKS endpoint, issuer and "authenticated"
 * audience) against a stub JWKS server, to check the resource-server config in application.properties.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class SupabaseJwtValidationTest {

	private static final ECKey SIGNING_KEY = generateKey("supabase-key");

	private static final ECKey OTHER_KEY = generateKey("other-key");

	private static final HttpServer JWKS_SERVER = startJwksServer();

	private static final String SUPABASE_URL = "http://127.0.0.1:" + JWKS_SERVER.getAddress().getPort();

	private static final String ISSUER = SUPABASE_URL + "/auth/v1";

	@Autowired
	private MockMvc mvc;

	@DynamicPropertySource
	static void supabaseUrl(DynamicPropertyRegistry registry) {
		registry.add("SUPABASE_URL", () -> SUPABASE_URL);
	}

	@AfterAll
	static void stopJwksServer() {
		JWKS_SERVER.stop(0);
	}

	@Test
	void acceptsValidSupabaseToken() throws Exception {
		// Authenticated, but no profile yet.
		mvc.perform(get("/api/me").header("Authorization", bearer(SIGNING_KEY, ISSUER, "authenticated")))
			.andExpect(status().isNotFound());
	}

	@Test
	void rejectsWrongIssuer() throws Exception {
		mvc.perform(get("/api/me").header("Authorization", bearer(SIGNING_KEY, "https://evil.example/auth/v1", "authenticated")))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void rejectsWrongAudience() throws Exception {
		mvc.perform(get("/api/me").header("Authorization", bearer(SIGNING_KEY, ISSUER, "anon")))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void rejectsTokenSignedByUnknownKey() throws Exception {
		mvc.perform(get("/api/me").header("Authorization", bearer(OTHER_KEY, ISSUER, "authenticated")))
			.andExpect(status().isUnauthorized());
	}

	private static String bearer(ECKey key, String issuer, String audience) throws JOSEException {
		Instant now = Instant.now();
		JWTClaimsSet claims = new JWTClaimsSet.Builder().issuer(issuer)
			.audience(audience)
			.subject(UUID.randomUUID().toString())
			.claim("email", "user@example.com")
			.claim("role", "authenticated")
			.issueTime(Date.from(now))
			.expirationTime(Date.from(now.plusSeconds(3600)))
			.build();
		SignedJWT jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.ES256).keyID(key.getKeyID()).build(), claims);
		jwt.sign(new ECDSASigner(key));
		return "Bearer " + jwt.serialize();
	}

	private static ECKey generateKey(String keyId) {
		try {
			return new ECKeyGenerator(Curve.P_256).keyID(keyId).generate();
		}
		catch (JOSEException ex) {
			throw new IllegalStateException(ex);
		}
	}

	private static HttpServer startJwksServer() {
		try {
			HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
			byte[] jwks = new JWKSet(SIGNING_KEY.toPublicJWK()).toString().getBytes(StandardCharsets.UTF_8);
			server.createContext("/auth/v1/.well-known/jwks.json", exchange -> {
				exchange.getResponseHeaders().add("Content-Type", "application/json");
				exchange.sendResponseHeaders(200, jwks.length);
				try (OutputStream body = exchange.getResponseBody()) {
					body.write(jwks);
				}
			});
			server.start();
			return server;
		}
		catch (IOException ex) {
			throw new IllegalStateException(ex);
		}
	}

}
