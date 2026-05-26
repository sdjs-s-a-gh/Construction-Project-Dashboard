<?php

/**
 * Database class.
 * 
 * This class is used to store details about Cloud SQL database to later execute SQL statements.
 */
class Database
{
    private string $serverName;
    private array $connectionInfo;
    private string $dbConnection;

    /** 
     * Constructs a new Database instance.
     * 
     * This constructor establishes a connection to a Cloud SQL database provided the information
     * given is correct.
     * 
     * @param string $serverName The name of the server on Azure accompanied by the port number,
     * which is given in the "Connection strings" PHP menu.
     * @param string $databaseName The name of the database held on the Azure SQL server.
     * @param string $uid The user ID used for authentication on the SQL server.
     * @param string $pwd The password used complete authentication.
     */
    public function __construct(string $serverName, string $databaseName, string $uid, string $pwd)
    {
        // Sets the relevant info to establish a connection to the database.
        $this->serverName = $serverName;
        $this->connectionInfo = array(
            "database" => $databaseName,
            "uid" => $uid,
            "pwd" => $pwd
        );

        // Sets the database connection.
        $this->dbConnection = sqlsrv_connect($this->serverName, $this->connectionInfo);

        if ($this->dbConnection == false) {
            throw new ClientError("Connection could not be established to the database.", 500);
        }
    }

    /** 
     * Executes an SQL statement on the database. The code here is adapted from the Week
     * 10 workshop, Part 2.
     * 
     * @param string $sqlQuery A valid SQL statement.
     * @param array<mixed> $params [optional] An index array containing the parameter(s)
     * to be substituted into the SQL statement. Currently, this website only has one array with
     * a single parameter, so the array is not necessary. However, this approach will be useful 
     * to future-proof the website if it was to be expanded upon with new queries.
     * 
     * @return array The result of excuting the given SQL query, which may return an empty array
     * if the query does not find any matches.
     */
    public function executeSQL(string $sqlQuery, $params = []): array
    {
        try {
            $dbConnection = $this->dbConnection;

            // Execute the query
            $stmt = sqlsrv_query($dbConnection, $sqlQuery, $params);

            if ($stmt === false) {
                throw new ClientError(json_encode(sqlsrv_errors()), 404);
            };

            // Format the response from the server into an associative array.
            $data = [];
            while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
                $data[] = $row;
            }

            sqlsrv_free_stmt($stmt);
            sqlsrv_close($dbConnection);

        } catch (Exception $exception) {
            throw new ClientError($exception->getMessage(), 500);
        }

        return $data;
    }
}
