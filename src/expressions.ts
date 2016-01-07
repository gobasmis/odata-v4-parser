import * as Utils from './utils';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as NameOrIdentifier from './nameOrIdentifier';
import * as ArrayOrObject from './json';

export function commonExpr(value:number[], index:number):Lexer.Token {
	var token = PrimitiveLiteral.primitiveLiteral(value, index) ||
		parameterAlias(value, index) ||
		ArrayOrObject.arrayOrObject(value, index) ||
		rootExpr(value, index) ||
		methodCallExpr(value, index) ||
		firstMemberExpr(value, index) ||
		functionExpr(value, index) ||
		negateExpr(value, index) ||
		parenExpr(value, index) ||
		castExpr(value, index);

	if (!token) return;

	var expr = addExpr(value, token.next) ||
		subExpr(value, token.next) ||
		mulExpr(value, token.next) ||
		divExpr(value, token.next) ||
		modExpr(value, token.next);

	if (expr) {
		token.value = {
			left: Lexer.clone(token),
			right: expr.value
		};
		token.next = expr.value.next;
		token.type = expr.type;
		token.raw = Utils.stringify(value, token.position, token.next);
	}

	if (token) return Lexer.tokenize(value, token.position, token.next, token, Lexer.TokenType.CommonExpression);
};

export function boolCommonExpr(value:number[], index:number):Lexer.Token {
	var token = isofExpr(value, index) ||
		boolMethodCallExpr(value, index) ||
		notExpr(value, index) ||
		commonExpr(value, index) ||
		boolParenExpr(value, index);

	if (!token) return;

	var commonMoreExpr = undefined;
	if (token.type == Lexer.TokenType.CommonExpression) {
		commonMoreExpr = eqExpr(value, token.next) ||
		neExpr(value, token.next) ||
		ltExpr(value, token.next) ||
		leExpr(value, token.next) ||
		gtExpr(value, token.next) ||
		geExpr(value, token.next) ||
		hasExpr(value, token.next);

		if (commonMoreExpr) {
			token.value = {
				left: token.value,
				right: commonMoreExpr.value
			};
			token.next = commonMoreExpr.value.next;
			token.type = commonMoreExpr.type;
			token.raw = Utils.stringify(value, token.position, token.next);
		}
	}

	var expr = andExpr(value, token.next) ||
		orExpr(value, token.next);

	if (expr) {
		token.next = expr.value.next;
		token.value = {
			left: Lexer.clone(token),
			right: expr.value
		};
		token.type = expr.type;
		token.raw = Utils.stringify(value, token.position, token.next);
	}

	return token;
};

export function andExpr(value:number[], index:number):Lexer.Token {
	var rws = Lexer.RWS(value, index);
	if (rws == index || !Utils.equals(value, rws, 'and')) return;
	var start = index;
	index = rws + 3;
	rws = Lexer.RWS(value, index);
	if (rws == index) return;
	index = rws;
	var token = boolCommonExpr(value, index);
	if (!token) return;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.AndExpression);
};

export function orExpr(value:number[], index:number):Lexer.Token {
	var rws = Lexer.RWS(value, index);
	if (rws == index || !Utils.equals(value, rws, 'or')) return;
	var start = index;
	index = rws + 2;
	rws = Lexer.RWS(value, index);
	if (rws == index) return;
	index = rws;
	var token = boolCommonExpr(value, index);
	if (!token) return;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.OrExpression);
};

export function leftRightExpr(value:number[], index:number, expr:string, tokenType:Lexer.TokenType):Lexer.Token {
	var rws = Lexer.RWS(value, index);
	if (rws == index) return;
	var start = index;
	index = rws;
	if (!Utils.equals(value, index, expr)) return;
	index += expr.length;
	rws = Lexer.RWS(value, index);
	if (rws == index) return;
	index = rws;
	var token = commonExpr(value, index);
	if (!token) return;

	return Lexer.tokenize(value, start, index, token.value, tokenType);
};
export function eqExpr(value:number[], index:number):Lexer.Token { return leftRightExpr(value, index, 'eq', Lexer.TokenType.EqualsExpression); }
export function neExpr(value:number[], index:number):Lexer.Token { return leftRightExpr(value, index, 'ne', Lexer.TokenType.NotEqualsExpression); }
export function ltExpr(value:number[], index:number):Lexer.Token { return leftRightExpr(value, index, 'lt', Lexer.TokenType.LesserThanExpression); }
export function leExpr(value:number[], index:number):Lexer.Token { return leftRightExpr(value, index, 'le', Lexer.TokenType.LesserOrEqualsExpression); }
export function gtExpr(value:number[], index:number):Lexer.Token { return leftRightExpr(value, index, 'gt', Lexer.TokenType.GreaterThanExpression); }
export function geExpr(value:number[], index:number):Lexer.Token { return leftRightExpr(value, index, 'ge', Lexer.TokenType.GreaterOrEqualsExpression); }
export function hasExpr(value:number[], index:number):Lexer.Token { return leftRightExpr(value, index, 'has', Lexer.TokenType.HasExpression); }

export function addExpr(value:number[], index:number):Lexer.Token { return leftRightExpr(value, index, 'add', Lexer.TokenType.AddExpression); }
export function subExpr(value:number[], index:number):Lexer.Token { return leftRightExpr(value, index, 'sub', Lexer.TokenType.SubExpression); }
export function mulExpr(value:number[], index:number):Lexer.Token { return leftRightExpr(value, index, 'mul', Lexer.TokenType.MulExpression); }
export function divExpr(value:number[], index:number):Lexer.Token { return leftRightExpr(value, index, 'div', Lexer.TokenType.DivExpression); }
export function modExpr(value:number[], index:number):Lexer.Token { return leftRightExpr(value, index, 'mod', Lexer.TokenType.ModExpression); }

export function notExpr(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, 'not')) return;
	var start = index;
	index += 3;
	var rws = Lexer.RWS(value, index);
	if (rws == index) return;
	index = rws;
	var token = boolCommonExpr(value, index);
	if (!token) return;

	return Lexer.tokenize(value, start, token.next, token, Lexer.TokenType.NotExpression);
};

export function boolParenExpr(value:number[], index:number):Lexer.Token {
	if (!Lexer.OPEN(value[index])) return;
	var start = index;
	index++;
	index = Lexer.BWS(value, index);
	var token = boolCommonExpr(value, index);
	if (!token) return;
	index = Lexer.BWS(value, token.next);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, token, Lexer.TokenType.BoolParenExpression);
};
export function parenExpr(value:number[], index:number):Lexer.Token {
	if (!Lexer.OPEN(value[index])) return;
	var start = index;
	index++;
	index = Lexer.BWS(value, index);
	var token = commonExpr(value, index);
	if (!token) return;
	index = Lexer.BWS(value, token.next);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, token.value, Lexer.TokenType.ParenExpression);
};

export function boolMethodCallExpr(value:number[], index:number):Lexer.Token {
	return endsWithMethodCallExpr(value, index) ||
		startsWithMethodCallExpr(value, index) ||
		containsMethodCallExpr(value, index) ||
		intersectsMethodCallExpr(value, index);
};
export function methodCallExpr(value:number[], index:number):Lexer.Token {
	return indexOfMethodCallExpr(value, index) ||
		toLowerMethodCallExpr(value, index) ||
		toUpperMethodCallExpr(value, index) ||
		trimMethodCallExpr(value, index) ||
		substringMethodCallExpr(value, index) ||
		concatMethodCallExpr(value, index) ||
		lengthMethodCallExpr(value, index) ||
		yearMethodCallExpr(value, index) ||
		monthMethodCallExpr(value, index) ||
		dayMethodCallExpr(value, index) ||
		hourMethodCallExpr(value, index) ||
		minuteMethodCallExpr(value, index) ||
		secondMethodCallExpr(value, index) ||
		fractionalsecondsMethodCallExpr(value, index) ||
		totalsecondsMethodCallExpr(value, index) ||
		dateMethodCallExpr(value, index) ||
		timeMethodCallExpr(value, index) ||
		roundMethodCallExpr(value, index) ||
		floorMethodCallExpr(value, index) ||
		ceilingMethodCallExpr(value, index) ||
		distanceMethodCallExpr(value, index) ||
		geoLengthMethodCallExpr(value, index) ||
		totalOffsetMinutesMethodCallExpr(value, index) ||
		minDateTimeMethodCallExpr(value, index) ||
		maxDateTimeMethodCallExpr(value, index) ||
		nowMethodCallExpr(value, index);
};
export function methodCallExprFactory(value:number[], index:number, method:string, min?:number, max?:number):Lexer.Token {
	if (typeof min == 'undefined') min = 0;
	if (typeof max == 'undefined') max = min;

	if (!Utils.equals(value, index, method)) return;
	var start = index;
	index += method.length;
	if (!Lexer.OPEN(value[index])) return;
	index++;
	index = Lexer.BWS(value, index);
	var parameters;
	if (min > 0) {
		parameters = [];
		while (parameters.length < max) {
			var expr = commonExpr(value, index);
			if (parameters.length < min && !expr) return;
			else if (expr) {
				parameters.push(expr.value);
				index = expr.next;
				index = Lexer.BWS(value, index);
				if (parameters.length < min && !Lexer.COMMA(value[index])) return;
				if (Lexer.COMMA(value[index])) index++;
				else break;
				index = Lexer.BWS(value, index);
			} else break;
		}
	}
	index = Lexer.BWS(value, index);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, {
		method: method,
		parameters: parameters
	}, Lexer.TokenType.MethodCallExpression);
};
export function containsMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'contains', 2); }
export function startsWithMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'startswith', 2); }
export function endsWithMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'endswith', 2); }
export function lengthMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'length', 1); }
export function indexOfMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'indexof', 2); }
export function substringMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'substring', 2, 3); }
export function toLowerMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'tolower', 1); }
export function toUpperMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'toupper', 1); }
export function trimMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'trim', 1); }
export function concatMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'concat', 2); }

export function yearMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'year', 1); }
export function monthMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'month', 1); }
export function dayMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'day', 1); }
export function hourMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'hour', 1); }
export function minuteMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'minute', 1); }
export function secondMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'second', 1); }
export function fractionalsecondsMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'fractionalseconds', 1); }
export function totalsecondsMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'totalseconds', 1); }
export function dateMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'date', 1); }
export function timeMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'time', 1); }
export function totalOffsetMinutesMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'totaloffsetminutes', 1); }

export function minDateTimeMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'mindatetime', 0); }
export function maxDateTimeMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'maxdatetime', 0); }
export function nowMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'now', 0); }

export function roundMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'round', 1); }
export function floorMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'floor', 1); }
export function ceilingMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'ceiling', 1); }

export function distanceMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'geo.distance', 2); }
export function geoLengthMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'geo.length', 1); }
export function intersectsMethodCallExpr(value:number[], index:number):Lexer.Token { return methodCallExprFactory(value, index, 'geo.intersects', 2); }

export function isofExpr(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, 'isof')) return;
	var start = index;
	index += 4;
	if (!Lexer.OPEN(value[index])) return;
	index++;
	index = Lexer.BWS(value, index);
	var expr = commonExpr(value, index);
	if (expr) {
		index = expr.next;
		index = Lexer.BWS(value, index);
		if (!Lexer.COMMA(value[index])) return;
		index++;
		index = Lexer.BWS(value, index);
	}
	var typeName = NameOrIdentifier.qualifiedTypeName(value, index);
	if (!typeName) return;
	index = typeName.next;
	index = Lexer.BWS(value, index);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, {
		target: expr,
		typename: typeName
	}, Lexer.TokenType.IsOfExpression);
}
export function castExpr(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, 'cast')) return;
	var start = index;
	index += 4;
	if (!Lexer.OPEN(value[index])) return;
	index++;
	index = Lexer.BWS(value, index);
	var expr = commonExpr(value, index);
	if (expr) {
		index = expr.next;
		index = Lexer.BWS(value, index);
		if (!Lexer.COMMA(value[index])) return;
		index++;
		index = Lexer.BWS(value, index);
	}
	var typeName = NameOrIdentifier.qualifiedTypeName(value, index);
	if (!typeName) return;
	index = typeName.next;
	index = Lexer.BWS(value, index);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, {
		target: expr,
		typename: typeName
	}, Lexer.TokenType.CastExpression);
}

export function negateExpr(value:number[], index:number):Lexer.Token {
	if (value[index] != 0x2d) return;
	var start = index;
	index++;
	index = Lexer.BWS(value, index);
	var expr = commonExpr(value, index);
	if (!expr) return;

	return Lexer.tokenize(value, start, expr.next, expr, Lexer.TokenType.NegateExpression);
}

export function firstMemberExpr(value:number[], index:number):Lexer.Token {
	var token = inscopeVariableExpr(value, index);
	var member;
	var start = index;

	if (token) {
		if (value[token.next] == 0x2f) {
			index = token.next + 1;
			member = memberExpr(value, index);
			if (!member) return;

			return Lexer.tokenize(value, start, member.next, [token, member], Lexer.TokenType.FirstMemberExpression);
		}
	} else member = memberExpr(value, index);

	token = token || member;
	if (!token) return;

	return Lexer.tokenize(value, start, token.next, token, Lexer.TokenType.FirstMemberExpression);
}
export function memberExpr(value:number[], index:number):Lexer.Token {
	var start = index;
	var token = NameOrIdentifier.qualifiedEntityTypeName(value, index);

	if (token) {
		if (value[token.next] != 0x2f) return;
		index = token.next + 1;
	}

	var next = propertyPathExpr(value, index) ||
		boundFunctionExpr(value, index);

	if (!next) return;
	return Lexer.tokenize(value, start, next.next, token ? { name: token, value: next } : { value: next }, Lexer.TokenType.MemberExpression);
}
export function propertyPathExpr(value:number[], index:number):Lexer.Token {
	var token = NameOrIdentifier.odataIdentifier(value, index);
	if (token){
		var nav = collectionPathExpr(value, token.next) ||
			collectionNavigationExpr(value, token.next) ||
			singleNavigationExpr(value, token.next) ||
			complexPathExpr(value, token.next) ||
			singlePathExpr(value, token.next);

		if (nav) {
			token.value = {
				current: Lexer.clone(token),
				next: nav
			};
			token.next = nav.next;
			token.raw = Utils.stringify(value, token.position, token.next);
		}
	} else token = token || NameOrIdentifier.streamProperty(value, index);

	if (!token) return;
	return Lexer.tokenize(value, index, token.next, token, Lexer.TokenType.PropertyPathExpression);
}
export function inscopeVariableExpr(value:number[], index:number):Lexer.Token {
	return implicitVariableExpr(value, index) ||
		(isLambdaPredicate ? lambdaVariableExpr(value, index) : undefined);
}
export function implicitVariableExpr(value:number[], index:number):Lexer.Token {
	if (Utils.equals(value, index, '$it')) return Lexer.tokenize(value, index, index + 3, '$it', Lexer.TokenType.ImplicitVariableExpression);
}
var isLambdaPredicate = false;
var hasLambdaVariableExpr = false;
export function lambdaVariableExpr(value:number[], index:number):Lexer.Token {
	var token = NameOrIdentifier.odataIdentifier(value, index, Lexer.TokenType.LambdaVariableExpression);
	if (token){
		hasLambdaVariableExpr = true;
		return token;
	}
}
export function lambdaPredicateExpr(value:number[], index:number):Lexer.Token {
	isLambdaPredicate = true;
	var token = boolCommonExpr(value, index);
	isLambdaPredicate = false;
	if (token && hasLambdaVariableExpr){
		hasLambdaVariableExpr = false;
		return Lexer.tokenize(value, token.position, token.next, token, Lexer.TokenType.LambdaPredicateExpression);
	}
}
export function anyExpr(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, 'any')) return;
	var start = index;
	index += 3;
	if (!Lexer.OPEN(value[index])) return;
	index++
	index = Lexer.BWS(value, index);
	var variable = lambdaVariableExpr(value, index);
	var predicate;
	if (variable){
		index = variable.next;
		index = Lexer.BWS(value, index);
		if (!Lexer.COLON(value[index])) return;
		index++;
		index = Lexer.BWS(value, index);
		predicate = lambdaPredicateExpr(value, index);
		if (!predicate) return;
		index = predicate.next;
	}
	index = Lexer.BWS(value, index);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, {
		variable: variable,
		predicate: predicate
	}, Lexer.TokenType.AnyExpression);
}
export function allExpr(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, 'all')) return;
	var start = index;
	index += 3;
	if (!Lexer.OPEN(value[index])) return;
	index++
	index = Lexer.BWS(value, index);
	var variable = lambdaVariableExpr(value, index);
	if (!variable) return;
	index = variable.next;
	index = Lexer.BWS(value, index);
	if (!Lexer.COLON(value[index])) return;
	index++;
	index = Lexer.BWS(value, index);
	var predicate = lambdaPredicateExpr(value, index);
	if (!predicate) return;
	index = predicate.next;
	index = Lexer.BWS(value, index);
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, {
		variable: variable,
		predicate: predicate
	}, Lexer.TokenType.AllExpression);
}

export function collectionNavigationExpr(value:number[], index:number):Lexer.Token {
	var start = index;
	var entity, predicate, navigation, path;
	if (value[index] == 0x2f){
		index++;
		entity = NameOrIdentifier.qualifiedEntityTypeName(value, index);
		if (!entity) return;
		index = entity.next;
	}

	predicate = keyPredicate(value, index);

	if (predicate){
		navigation = singleNavigationExpr(value, index);
	}else{
		path = collectionPathExpr(value, index);
	}

	if (index > start){
		return Lexer.tokenize(value, start, index, {
			entity: entity,
			predicate: predicate,
			navigation: navigation,
			path: path
		}, Lexer.TokenType.CollectionNavigationExpression);
	}
}
export function keyPredicate(value:number[], index:number):Lexer.Token {
	return simpleKey(value, index) ||
		compoundKey(value, index);
}
export function simpleKey(value:number[], index:number):Lexer.Token {
	if (!Lexer.OPEN(value[index])) return;
	var start = index;
	index++;

	var key = keyPropertyValue(value, index);
	if (!key || !Lexer.CLOSE(value[key.next])) return;

	return Lexer.tokenize(value, start, key.next + 1, key, Lexer.TokenType.SimpleKey);
}
export function compoundKey(value:number[], index:number):Lexer.Token {
	if (!Lexer.OPEN(value[index])) return;
	var start = index;
	index++;

	var pair = keyValuePair(value, index);
	if (!pair) return;

	var keys = [];
	while (pair){
		keys.push(pair);
		if (Lexer.COMMA(value[pair.next])) pair = keyValuePair(value, pair.next + 1);
		else pair = null;
	}

	index = keys[keys.length - 1].next;
	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, keys, Lexer.TokenType.CompoundKey);
}
export function keyValuePair(value:number[], index:number):Lexer.Token {
	var prop = NameOrIdentifier.primitiveKeyProperty(value, index) ||
		keyPropertyAlias(value, index);

	if (!prop || !Lexer.EQ(value[prop.next])) return;

	var val = keyPropertyValue(value, prop.next + 1);
	if (val) return Lexer.tokenize(value, index, val.next, {
		key: prop,
		value: val
	}, Lexer.TokenType.KeyValuePair);
}
export function keyPropertyValue(value:number[], index:number):Lexer.Token {
	var token = PrimitiveLiteral.primitiveLiteral(value, index);
	if (token){
		token.type = Lexer.TokenType.KeyPropertyValue;
		return token;
	}
}
export function keyPropertyAlias(value:number[], index:number):Lexer.Token { return NameOrIdentifier.odataIdentifier(value, index, Lexer.TokenType.KeyPropertyAlias); }

export function singleNavigationExpr(value:number[], index:number):Lexer.Token {
	if (value[index] != 0x2f) return;
	var member = memberExpr(value, index + 1);
	if (member) return Lexer.tokenize(value, index, member.next, member, Lexer.TokenType.SingleNavigationExpression);
}
export function collectionPathExpr(value:number[], index:number):Lexer.Token {
	var token = countExpr(value, index);
	if (!token) {
		if (value[index] == 0x2f) {
			token = boundFunctionExpr(value, index + 1) ||
			anyExpr(value, index + 1) ||
			allExpr(value, index + 1);
		}
	}

	if (token) return Lexer.tokenize(value, index, token.next, token, Lexer.TokenType.CollectionPathExpression);
}
export function complexPathExpr(value:number[], index:number):Lexer.Token {
	if (value[index] != 0x2f) return;
	var start = index;
	index++;
	var token = NameOrIdentifier.qualifiedComplexTypeName(value, index);
	if (token) {
		if (value[token.next] != 0x2f) return;
		index = token.next + 1;
	}

	var expr = propertyPathExpr(value, index) ||
		boundFunctionExpr(value, index);

	if (expr) return Lexer.tokenize(value, start, expr.next, token ? [token, expr] : [expr], Lexer.TokenType.ComplexPathExpression);
}
export function singlePathExpr(value:number[], index:number):Lexer.Token {
	if (value[index] != 0x2f) return;
	var boundFunction = boundFunctionExpr(value, index + 1);
	if (boundFunction) return Lexer.tokenize(value, index, boundFunction.next, boundFunction, Lexer.TokenType.SinglePathExpression);
}
export function functionExpr(value:number[], index:number):Lexer.Token {
	var namespaceNext = NameOrIdentifier.namespace(value, index);
	if (namespaceNext == index || value[namespaceNext] != 0x2e) return;
	var start = index;
	index = namespaceNext + 1;

	var token = NameOrIdentifier.odataIdentifier(value, index);

	if (!token) return;
	token.position = start;
	token.raw = Utils.stringify(value, start, token.next)

	index = token.next;
	var params = functionExprParameters(value, index);

	if (!params) return;

	index = params.next;
	var expr = collectionPathExpr(value, index) ||
		collectionNavigationExpr(value, index) ||
		singleNavigationExpr(value, index) ||
		complexPathExpr(value, index) ||
		singlePathExpr(value, index);

	if (expr) index = expr.next;

	return Lexer.tokenize(value, start, index, {
		fn: token,
		params: params,
		expression: expr
	}, Lexer.TokenType.FunctionExpression);
}
export function boundFunctionExpr(value:number[], index:number):Lexer.Token { return functionExpr(value, index); }

export function functionExprParameters(value:number[], index:number):Lexer.Token {
	if (!Lexer.OPEN(value[index])) return;
	var start = index;
	index++;

	var params = [];
	var expr = functionExprParameter(value, index);
	while (expr) {
		params.push(expr);
		if (Lexer.COMMA(expr.next)) {
			index = expr.next + 1;
			expr = functionExprParameter(value, index);
			if (!expr) return;
		} else {
			index = expr.next;
			expr = null;
		}
	}

	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, params, Lexer.TokenType.FunctionExpressionParameters);
}
export function functionExprParameter(value:number[], index:number):Lexer.Token {
	var name = parameterName(value, index);
	if (!name || !Lexer.EQ(value[name.next])) return;

	var start = index;
	index = name.next + 1;

	var param = parameterAlias(value, index) ||
		parameterValue(value, index);

	if (!param) return;
	return Lexer.tokenize(value, start, param.next, {
		name: name,
		value: param
	}, Lexer.TokenType.FunctionExpressionParameter);
}
export function parameterName(value:number[], index:number):Lexer.Token { return NameOrIdentifier.odataIdentifier(value, index, Lexer.TokenType.ParameterName); }
export function parameterAlias(value:number[], index:number):Lexer.Token {
	if (!Lexer.AT(value[index])) return;
	var id = NameOrIdentifier.odataIdentifier(value, index + 1);
	if (id) return Lexer.tokenize(value, index, id.next, id.value, Lexer.TokenType.ParameterAlias);
}
export function parameterValue(value:number[], index:number):Lexer.Token {
	var token = ArrayOrObject.arrayOrObject(value, index) ||
		commonExpr(value, index);
	if (token) return Lexer.tokenize(value, index, token.next, token.value, Lexer.TokenType.ParameterValue);
}

export function countExpr(value:number[], index:number):Lexer.Token {
	if (Utils.equals(value, index, '/$count')) return Lexer.tokenize(value, index, index + 7, '/$count', Lexer.TokenType.CountExpression);
}
export function refExpr(value:number[], index:number):Lexer.Token {
	if (Utils.equals(value, index, '/$ref')) return Lexer.tokenize(value, index, index + 5, '/$ref', Lexer.TokenType.RefExpression);
}
export function valueExpr(value:number[], index:number):Lexer.Token {
	if (Utils.equals(value, index, '/$value')) return Lexer.tokenize(value, index, index + 7, '/$value', Lexer.TokenType.ValueExpression);
}

export function rootExpr(value:number[], index:number):Lexer.Token {
	if (!Utils.equals(value, index, '$root/')) return;
	var start = index;
	index += 6;

	var entitySet = NameOrIdentifier.entitySetName(value, index);
	var predicate, entity, token;
	if (entitySet) predicate = keyPredicate(value, entitySet.next);
	if (!(entitySet && predicate)){
		entity = NameOrIdentifier.singletonEntity(value, index);
		if (!entity) return;
		token = {
			entity: entity
		};
	}else token = {
		entitySet: entitySet,
		keys: predicate
	}

	index = (predicate || entity).next;
	var nav = singleNavigationExpr(value, index);
	if (nav) index = nav.next;

	return Lexer.tokenize(value, start, index, {
		current: token,
		next: nav
	}, Lexer.TokenType.RootExpression);
}