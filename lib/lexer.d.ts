export declare class TokenType {
    static Literal: string;
    static ArrayOrObject: string;
    static Array: string;
    static Object: string;
    static Property: string;
    static Annotation: string;
    static Enum: string;
    static EnumValue: string;
    static EnumMemberValue: string;
    static Identifier: string;
    static ODataIdentifier: string;
    static Collection: string;
    static NamespacePart: string;
    static EntitySetName: string;
    static SingletonEntity: string;
    static EntityTypeName: string;
    static ComplexTypeName: string;
    static TypeDefinitionName: string;
    static EnumerationTypeName: string;
    static EnumerationMember: string;
    static TermName: string;
    static PrimitiveProperty: string;
    static PrimitiveKeyProperty: string;
    static PrimitiveNonKeyProperty: string;
    static PrimitiveCollectionProperty: string;
    static ComplexProperty: string;
    static ComplexColProperty: string;
    static StreamProperty: string;
    static NavigationProperty: string;
    static EntityNavigationProperty: string;
    static EntityCollectionNavigationProperty: string;
    static Action: string;
    static ActionImport: string;
    static Function: string;
    static EntityFunction: string;
    static EntityCollectionFunction: string;
    static ComplexFunction: string;
    static ComplexCollectionFunction: string;
    static PrimitiveFunction: string;
    static PrimitiveCollectionFunction: string;
    static EntityFunctionImport: string;
    static EntityCollectionFunctionImport: string;
    static ComplexFunctionImport: string;
    static ComplexCollectionFunctionImport: string;
    static PrimitiveFunctionImport: string;
    static PrimitiveCollectionFunctionImport: string;
    static CommonExpression: string;
    static AndExpression: string;
    static OrExpression: string;
    static EqualsExpression: string;
    static NotEqualsExpression: string;
    static LesserThanExpression: string;
    static LesserOrEqualsExpression: string;
    static GreaterThanExpression: string;
    static GreaterOrEqualsExpression: string;
    static HasExpression: string;
    static AddExpression: string;
    static SubExpression: string;
    static MulExpression: string;
    static DivExpression: string;
    static ModExpression: string;
    static NotExpression: string;
    static BoolParenExpression: string;
    static ParenExpression: string;
    static MethodCallExpression: string;
    static IsOfExpression: string;
    static CastExpression: string;
    static NegateExpression: string;
    static FirstMemberExpression: string;
    static MemberExpression: string;
    static PropertyPathExpression: string;
    static ImplicitVariableExpression: string;
    static LambdaVariable: string;
    static LambdaVariableExpression: string;
    static LambdaPredicateExpression: string;
    static AnyExpression: string;
    static AllExpression: string;
    static CollectionNavigationExpression: string;
    static SimpleKey: string;
    static CompoundKey: string;
    static KeyValuePair: string;
    static KeyPropertyValue: string;
    static KeyPropertyAlias: string;
    static SingleNavigationExpression: string;
    static CollectionPathExpression: string;
    static ComplexPathExpression: string;
    static SinglePathExpression: string;
    static FunctionExpression: string;
    static FunctionExpressionParameters: string;
    static FunctionExpressionParameter: string;
    static ParameterName: string;
    static ParameterAlias: string;
    static ParameterValue: string;
    static CountExpression: string;
    static RefExpression: string;
    static ValueExpression: string;
    static RootExpression: string;
}
export declare class Token {
    position: number;
    next: number;
    value: any;
    type: TokenType;
    raw: string;
    constructor(token: any);
}
export declare function tokenize(value: number[], index: number, next: number, tokenValue: any, tokenType: TokenType): Token;
export declare function clone(token: any): Token;
export declare function ALPHA(value: number): boolean;
export declare function DIGIT(value: number): boolean;
export declare function HEXDIG(value: number): boolean;
export declare function AtoF(value: number): boolean;
export declare function DQUOTE(value: number): boolean;
export declare function SP(value: number): boolean;
export declare function HTAB(value: number): boolean;
export declare function VCHAR(value: number): boolean;
export declare function OWS(value: number[], index: number): number;
export declare function RWS(value: number[], index: number): number;
export declare function BWS(value: number[], index: number): number;
export declare function AT(value: number): boolean;
export declare function COLON(value: number): boolean;
export declare function COMMA(value: number): boolean;
export declare function EQ(value: number): boolean;
export declare function SIGN(value: number): boolean;
export declare function SEMI(value: number): boolean;
export declare function STAR(value: number): boolean;
export declare function SQUOTE(value: number): boolean;
export declare function OPEN(value: number): boolean;
export declare function CLOSE(value: number): boolean;
export declare function unreserved(value: number): boolean;
export declare function otherDelims(value: number): boolean;
export declare function subDelims(value: number): boolean;
export declare function pctEncoded(value: number[], index: number): number;
export declare function pctEncodedNoSQUOTE(value: number[], index: number): number;
export declare function pchar(value: number[], index: number): number;
export declare function pcharNoSQUOTE(value: number[], index: number): number;
export declare function base64char(value: number): boolean;
export declare function base64b16(value: number[], index: number): number;
export declare function base64b8(value: number[], index: number): number;
export declare function nanInfinity(value: number[], index: number): number;
export declare function oneToNine(value: number): boolean;
export declare function zeroToFiftyNine(value: number[], index: number): number;
export declare function year(value: number[], index: number): number;
export declare function month(value: number[], index: number): number;
export declare function day(value: number[], index: number): number;
export declare function hour(value: number[], index: number): number;
export declare function minute(value: number[], index: number): number;
export declare function second(value: number[], index: number): number;
export declare function fractionalSeconds(value: number[], index: number): number;
export declare function geographyPrefix(value: number[], index: number): number;
export declare function geometryPrefix(value: number[], index: number): number;
export declare function identifierLeadingCharacter(value: number): boolean;
export declare function identifierCharacter(value: number): boolean;
export declare function beginObject(value: number[], index: number): number;
export declare function endObject(value: number[], index: number): number;
export declare function beginArray(value: number[], index: number): number;
export declare function endArray(value: number[], index: number): number;
export declare function quotationMark(value: number[], index: number): number;
export declare function nameSeparator(value: number[], index: number): number;
export declare function valueSeparator(value: number[], index: number): number;
export declare function escape(value: number[], index: number): number;