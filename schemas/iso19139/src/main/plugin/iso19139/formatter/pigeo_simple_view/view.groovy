import iso19139.PigeoSummaryFactory

def isoHandlers = new iso19139.Handlers(handlers, f, env)

PigeoSummaryFactory.summaryHandler({it.parent() is it.parent()}, isoHandlers)

isoHandlers.addDefaultHandlers()
