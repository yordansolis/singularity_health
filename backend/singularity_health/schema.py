import graphene
import users.schema

class Query(users.schema.Query, graphene.ObjectType):
    pass

class Mutation(users.schema.Mutation, graphene.ObjectType):
    pass

## Este es el esquema de la API para poder interactuar con la base de datos
schema = graphene.Schema(query=Query, mutation=Mutation)