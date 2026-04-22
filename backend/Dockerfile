FROM maven:3.9.14-eclipse-temurin-25 AS build

WORKDIR /app

COPY backend/tevent/pom.xml ./pom.xml
RUN mvn -B -q dependency:go-offline

COPY backend/tevent/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:25

WORKDIR /app

COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
