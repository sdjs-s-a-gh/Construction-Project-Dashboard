<?php

/**
 * Database class.
 * 
 * This class is used to store details about Cloud SQL database and execute SQL
 * statements.
 */
class Database
{
    private $serverName;
    private $connectionInfo;
    private $dbConnection;

    /** 
     * Constructs a new Database instance.
     * 
     * This constructor establishes a connection to a Cloud SQL database
     * provided the information given is correct.
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
    }

    /** 
     * Returns the connection for the database.
     * 
     * @return resource The database connection as a "resource" to connect to the database.
     * Description taken from @https://www.php.net/manual/en/function.sqlsrv-connect.php. 
     */
    public function getConn()
    {
        return $this->dbConnection;
    }

    /** 
     * Executes an SQL statement on the database. 
     * 
     * @param string $sqlQuery A valid SQL statement.
     * @param array<mixed> $params [optional] An index array
     * containing the parameter(s) to be substituted into the SQL statement. Currently,
     * this website only has one array with a single parameter, so the array is not necessary.
     * However, this approach will be useful to future-proof the website if it website was to be
     * expanded upon with new queries.
     * 
     * @return array The result of excuting the given SQL query, which may return
     * an empty array if the query does not find any matches.
     */
    public function executeSQL(string $sqlQuery, $params=[]): array
    {
        // TODO: The variables for the code immediately below can be stored in an env file.
        // TODO: Add a try-catch here for the SQL connection. Maybe an asynch call as well with a loading screen.
        // TODO: Could store this data in the Azure Key Vault as well.
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

        return $data;
    }
}
