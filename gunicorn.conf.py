import multiprocessing

bind             = "0.0.0.0:5000"
workers          = 1
worker_class     = "sync"
timeout          = 120
keepalive        = 5
max_requests     = 1000
max_requests_jitter = 100
graceful_timeout = 30
preload_app      = False
accesslog        = "-"
errorlog         = "-"
loglevel         = "info"
forwarded_allow_ips = "*"
