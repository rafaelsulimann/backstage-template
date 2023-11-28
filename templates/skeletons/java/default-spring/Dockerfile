FROM maven:3.8.4-openjdk-17-slim AS builder
WORKDIR /app
COPY . .
RUN mvn clean package

FROM openjdk:17-slim
WORKDIR /app
COPY --from=builder /app/target/default-spring-0.0.1-SNAPSHOT.jar ./default-spring.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/default-spring.jar"]