// GraphQL Service for handling API requests

/**
 * Function to execute GraphQL queries/mutations
 * @param {string} query - The GraphQL query/mutation
 * @param {Object} variables - Variables for the query/mutation
 * @returns {Promise} - Response from the server
 */
export const executeGraphQL = async (query, variables) => {
  try {
    console.log('Enviando consulta GraphQL:', query);
    console.log('Con variables:', variables);
    
    
    // const response = await fetch('http://127.0.0.1:7007/graphql/', {
      const response = await fetch('https://1afs3bt7ti.execute-api.us-east-1.amazonaws.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // credentials: 'same-origin',
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    if (!response.ok) {
      console.error(`Error HTTP: ${response.status} ${response.statusText}`);
      throw new Error(`Error de servidor: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Resultado GraphQL:', result);
    return result;
  } catch (error) {
    console.error('Error en la petición GraphQL:', error);
    throw error;
  }
};

// User-related GraphQL operations
export const userQueries = {
  CREATE_USER_MUTATION: `
    mutation CreateUser(
      $username: String!,
      $email: String!,
      $password: String!,
      $first_name: String!,
      $last_name: String!,
      $document_type: String!,
      $document_number: String!,
      $issue_date: Date!,
      $phone_number: String!,
      $address: String!,
      $city: String!,
      $country: String!
    ) {
      createUser(
        username: $username,
        email: $email,
        password: $password,
        firstName: $first_name,
        lastName: $last_name,
        documentType: $document_type,
        documentNumber: $document_number,
        issueDate: $issue_date,
        phoneNumber: $phone_number,
        address: $address,
        city: $city,
        country: $country
      ) {
        user {
          id
          username
          email
          firstName
          lastName
        }
      }
    }
  `
}; 