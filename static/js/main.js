var brwsr =  {
    template: `
    <div class="list-group">
        <a 
            v-for="item in items" 
            class="list-group-item list-group-item-action" 
            v-bind:class="{'list-group-item-secondary':item.directory}" 
            v-on:click="click(item.directory, item.filename)"
        >
            {{item.filename}}
        </a>
    </div>`,
    props: ['items', 'f_gfiles'],
    methods: {
        click: function(dir, filename) {
            if (dir) {
                if (filename != '..')
                    this.f_gfiles(filename)
                else{ //navigate to parent dir
                    this.f_gfiles(this.items[0].parent)
                }
            }
        }
    }
}

var cntrlr = {
    template: "<h3>{{msg}}</h3>",
    props: ['msg']
}

var app = new Vue({
    el: '#app',
    data: {
        running: false,
        file: '',
        name: '',
        position: '',
        duration: '',
        files: [{filename: 'asdad', directory: true}]
    },
    components: {
        "c_browser": brwsr,
        "c_controller": cntrlr
    },
    methods: {
        getStatus: function() {
            return fetch('/status')
            .then((response) => {
                if(response.ok) {
                    return response.json()
                }
                throw new Error('Can not get status from server')
            }).then((json) => {
                this.running = json.running == '' ? false:true
                this.file = json.file
                this.name = json.name
                this.position = json.position
                this.duration = json.duration
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

    created: function() {
        this.getStatus()
        .then(() => {
            if (this.running) {
                //todo: controller
            }else{
                this.get_files()
            }
        })
    }
})