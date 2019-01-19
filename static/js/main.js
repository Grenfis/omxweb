var gmenu = {
    template: `
    <nav class="navbar navbar-expand-xs navbar-dark bg-dark">
        <a class="navbar-brand" href="#">{{info.os}}</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarColor02">
            <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
                <a class="nav-link" href="#" v-on:click="reboot()">Reboot</a>
            </li>
            </ul>
        </div>
    </nav>
    `,
    data: function() {
        return {
            info: ''
        }
    },
    methods: {
        reboot: function() {
            fetch('/reboot')
            .then((response) => {
                if(response.ok) {
                    return
                }
                throw new Error('Can\'t get host info')
            }).catch((err) => {
                console.log(err)
            })
        }
    },
    created: function() {
        fetch('/host')
        .then((response) => {
            if(response.ok) {
                return response.json()
            }
            throw new Error('Can\'t get host info')
        }).then((json) => {
            this.info = json
        }).catch((err) => {
            console.log(err)
        })
    }
}

var brwsr =  {
    template: `
    <div class="col-12">
        <div class="list-group">
            <a 
                v-for="item in items" 
                class="list-group-item list-group-item-action" 
                v-bind:class="{'list-group-item-secondary':item.directory}" 
                v-on:click="click(item.directory, item.filename)"
            >
                {{item.filename}}
            </a>
        </div>
    </div>`,
    props: ['items', 'f_gfiles', 'cur_path'],
    methods: {
        click: function(dir, filename) {
            if (dir) {
                if (filename != '..')
                    this.f_gfiles(filename)
                else{ //navigate to parent dir
                    this.f_gfiles(this.items[0].parent)
                }
            }else{
                this.play_file(filename)
            }
        },
        
        play_file: function(file) {
            path = ''
            if (this.cur_path) {
                path = this.cur_path + '/'
            }
            path = '/play?file='+path+file
            fetch(path)
            .then((response) => {
                if(response.ok) {
                    return response.json()
                }
                throw new Error('Can not play file')
            }).then((json) => {
                if(!json.success) {
                    throw new Error('The launch of the video failed')
                }
            }).catch((err) => {
                console.log(err)
            })
        }
    }
}

var cntrlr = {
    template: `
    <div class="col-12">
        <div class="row">
            <div class="col p-3">
                <div class="text-info" style="text-align: center;">{{status.name}}</div>
                <div style="text-align: center;"><small>{{status.file}}</small></div>
            </div>
        </div>
        <div class="row">
            <div class="col-4">00:00:00</div>
            <div class="col-4" style="text-align: center;">{{status.position}}</div>
            <div class="col-4" style="text-align: right;">{{status.duration}}</div>
        </div>
        <div class="row">
            <div class="col p-3">
                <div class="progress my-1 border">
                    <div class="progress-bar" role="progressbar" v-bind:style="{width: cur_pos}" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col"></div>
            <div class="col">
                <div class="btn-group" role="group" aria-label="">
                    <button type="button" class="btn btn-secondary" v-on:click="control('stop')">STOP</button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('seek_back_fast')"><=</button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('seek_back')"><</button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('pause')">PLAY</button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('seek_forward')">></button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('seek_forward_fast')">=></button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('volume_down')">-</button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('volume_up')">+</button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('subtitles')">SUBS</button>
                </div>
            </div>
            <div class="col"></div>
        </div>
    </div>
    `,
    data: function() {
        return {
            cur_pos: 0
        }
    },
    props: ['status', 'get_status'],
    watch: {
        status: function(stat) {
            if(stat.running) {
                durItms = stat.duration.split(':')
                curItms = stat.position.split(':')

                durT = parseInt(durItms[0]+durItms[1]+durItms[2])
                curT = parseInt(curItms[0]+curItms[1]+curItms[2])

                this.cur_pos = (curT / durT) * 100 + '%'
            }
        }
    },
    methods: {
        control: function(c) {
            return fetch('/command/'+c)
            .then((response) => {
                if(response.ok) {
                    return response.json() 
                }
                throw new Error('Can\'t to execute a command')
            }).then((json) => {
                this.get_status()
            }).catch((err) => {
                console.log(err)
            })
        }
    }
}

var app = new Vue({
    el: '#app',
    data: {
        status: {
            running: false,
            file: '',
            name: '',
            position: '',
            duration: ''
        },
        cur_path: '',
        statUpdTimer: '',
        files: [],
        refreshDur: 2000
    },
    components: {
        "c_browser": brwsr,
        "c_controller": cntrlr,
        "c_gmenu": gmenu
    },
    methods: {
        get_status: function() {
            return fetch('/status')
            .then((response) => {
                if(response.ok) {
                    return response.json()
                }
                throw new Error('Can not get status from server')
            }).then((json) => {
                this.status = json
            }).catch((error) => {
                console.log(error)
            })
        },

        get_files: function(path) {
            return fetch('/browse?path=' + (path?path:''))
            .then((response) => {
                if(response.ok) {
                    return response.json()
                }
                throw new Error('Can not get file list from server')
            }).then((json) => {
                this.files = json
                //directories first
                this.files.sort(function(f1, f2) {
                    if (f1.directory && !f2.directory) {
                        return -1
                    }else if(!f1.directory && f2.directory){
                        return 1
                    }else{
                        return 0
                    }
                })
                if (path) {
                    //add parent link
                    items = path.split('/')
                    items.pop()
                    parent = items.join('/')
                    this.cur_path = path
                    this.files.unshift({
                        filename: '..',
                        parent: parent,
                        directory: true
                    })
                }
            }).catch((error) => {
                console.log(error)
            })
        }
    },
    watch: {
        status: function(stat) {
            if (!stat.running && this.status.running) {
                this.get_files()
            }
            this.status = stat
        }
    },

    created: function() {
        this.get_status()
        .then(() => {
            if (!this.running) {
                this.get_files()
            }
        })
        this.statUpdTimer = setInterval(this.get_status, this.refreshDur)
    }
})