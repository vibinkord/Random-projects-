// import java.sql.Connection;
// import java.sql.DriverManager;
// import java.sql.SQLException;
// import java.sql.Statement;

// public class Create_DB {
//     static final String DB_URL="jdbc:mysql://localhost:3306/";
//     static final String USER="root";
//     String databaseName="My_DB";
//     static  final String PASS="Vibinkord13@";
//     public static void main(String[] args) throws Exception {
//         try(Connection conn=DriverManager.getConnection(DB_URL,USER,PASS);
//         Statement stmt=conn.createStatement();){
//             String sql ="CREATE DATABASE My_DB";
//             stmt.executeUpdate(sql);

//             System.out.println("DATABASE CREATED");

//         }catch(SQLException e){
//             e.printStackTrace();
//         }
//     }
// }
import java.sql.*;
import java.util.Scanner;
import java.util.regex.*;

public class Create_DB {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter email: ");
        String email = sc.nextLine();

        String regex = "^[A-ZaV-z0-9+_.-]+@[A-Za-z0-9.-]+$";

        try {
            Pattern pattern = Pattern.compile(regex);
            Matcher matcher = pattern.matcher(email);

            if (matcher.matches()) {
                Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/testdb", "root", "Vibinkord13@");
                PreparedStatement ps = conn.prepareStatement("INSERT INTO users(email) VALUES(?)");
                ps.setString(1, email);
                ps.executeUpdate();
                System.out.println("Email is valid and saved to DB.");
                conn.close();
            } else {
                System.out.println("Invalid email format.");
            }

        } catch (PatternSyntaxException e) {
            System.out.println("Regex Error: " + e.getDescription());
        } catch (SQLException e) {
            System.out.println("DB Error: " + e.getMessage());
        }
    }
}
