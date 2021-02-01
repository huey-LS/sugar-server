import 'reflect-metadata';
import parse from 'co-body';

import { ControllerContext } from './application'

const parameterGetterMetadataKey = Symbol('_paramterGetter');

export function getter (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
  let method = descriptor.value;
  descriptor.value = async function (ctx: any, ...args) {
    let existingParameterGetters: ParameterGetter[] = Reflect.getOwnMetadata(parameterGetterMetadataKey, target, propertyName);
    let gotValues = [];
    if (existingParameterGetters) {
      for (let parameterGetter of existingParameterGetters) {
        gotValues[
          parameterGetter.index
        ] = await parameterGetter.getter(ctx);
      }
    }

    return method && method.call(this, ...gotValues, ctx, ...args);
  }
}

export function createParamterGetter (getterCallback: GetterCallback) {
  return function paramterValidate (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    let existingParameterGetters: ParameterGetter[] = Reflect.getOwnMetadata(parameterGetterMetadataKey, target, propertyKey) || [];
    existingParameterGetters.push({
      index: parameterIndex,
      getter: getterCallback
    })

    Reflect.defineMetadata(parameterGetterMetadataKey, existingParameterGetters, target, propertyKey);
  }
}


export function config (configKey: string): ((target: Object, propertyKey: string | symbol, parameterIndex: number) => void);
export function config (configKey: Object, propertyKey: string | symbol, parameterIndex: number): void;
export function config (configKey: string|Object, propertyKey?: string | symbol, parameterIndex?: number) {
  if (typeof configKey === 'string') {
    return createParamterGetter((ctx: ControllerContext) => {
      return ctx.app.config.get(configKey)
    })
  } else if (typeof configKey === 'object') {
    return createParamterGetter((ctx: ControllerContext) => {
      return ctx.app.config
    })(configKey, propertyKey, parameterIndex)
  }
}

export const Response = createParamterGetter((ctx) => {
  return ctx.response;
})
export const NodeResponse = createParamterGetter((ctx) => {
  return ctx.res;
})
export const Request = createParamterGetter((ctx) => {
  return ctx.request;
})
export const NodeRequest = createParamterGetter((ctx) => {
  return ctx.req;
})
export const Context = createParamterGetter((ctx) => {
  return ctx;
})

export const query = (key: string) => createParamterGetter((ctx) => {
  return ctx.query[key];
})

export const header = (key: string) => createParamterGetter((ctx) => {
  return ctx.headers[key];
})

export const params = (key: string) => createParamterGetter((ctx) => {
  return ctx.params[key];
})

export const body = () => createParamterGetter((ctx: any) => {
  return parse(ctx.req);
})

export const bodyJSON = (path?: string) => createParamterGetter(async (ctx: any) => {
  let parsedBodyJSON;
  if (ctx._parsedBodyJSON) {
    parsedBodyJSON = ctx._parsedBodyJSON;
  } else {
    parsedBodyJSON = await parse.json(ctx.req)
    ctx._parsedBodyJSON = parsedBodyJSON;
  }
  return findDataByPath(parsedBodyJSON, path);
})

export const bodyFormData = (path?: string) => createParamterGetter(async (ctx: any) => {
  let parsedBodyJSON;
  if (ctx._parsedBodyJSON) {
    parsedBodyJSON = ctx._parsedBodyJSON;
  } else {
    parsedBodyJSON = await parse.form(ctx.req)
    ctx._parsedBodyJSON = parsedBodyJSON;
  }

  return findDataByPath(parsedBodyJSON, path);
})

export const bodyText = () => createParamterGetter((ctx: any) => {
  return parse.text(ctx.req)
})

function findDataByPath (data: any, path?: string) {
  let result = data;
  if (typeof path === 'string') {
    const pathArr = path.split('.');
    for (let i = 0;i < pathArr.length; i++) {
      result = result[pathArr[i]];
      if (
        typeof result === 'undefined'
        || result === null
      ) {
        break;
      }
    }
  }
  return result;
}

interface GetterCallback {
  (ctx: ControllerContext): any
}

interface ParameterGetter {
  index: number,
  getter: GetterCallback,
}
