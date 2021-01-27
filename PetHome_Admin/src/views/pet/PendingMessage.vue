<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <!--
            :inline="true"：行内表单
            :model="searchForm" 双向绑定公共前缀
            -->
            <el-form :inline="true" :model="searchForm">
                <el-form-item label="标题">
                    <el-input v-model="searchForm.title" placeholder="部门"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="searchFormMessages" >查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="pendingMessages"  v-loading="listLoading" style="width: 100%;">
            <el-table-column prop="title" label="标题" >
            </el-table-column>
            <el-table-column prop="name" label="宠物" >
            </el-table-column>
            <el-table-column prop="price" label="价格" >
            </el-table-column>
            <el-table-column prop="age" label="年龄">
            </el-table-column>
            <el-table-column  label="性别" >
                <template scope="scope">
                    <span v-if="scope.row.gender==1">公</span>
                    <span v-else-if="scope.row.gender==0">母</span>
                </template>
            </el-table-column>
            <el-table-column prop="coatColor" label="毛色" >
            </el-table-column>
            <el-table-column prop="petType.name" label="宠物类型" >
            </el-table-column>
            <el-table-column prop="address" label="收购地址" >
            </el-table-column>
            <el-table-column  label="用户" >
                <template scope="scope">
                    <span>{{scope.row.user.username||scope.row.user.phone||scope.row.user.email}}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" >
                <template scope="scope">
                    <el-button size="small" @click="handle(scope.$index, scope.row)">处理</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
            </el-pagination>
        </el-col>


        <!--处理寻主信息-->
        <el-dialog :title="title" :visible.sync="addFormVisible" >
            <!--
                ref:简单理解就是申明form表单的id
                :rules:定义校验规则
             -->
            <el-form ref="form" :rules="rules"  :model="form" label-width="80px">
                <el-form-item label="用户" >
                    <el-input v-model="form.username" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="宠物类型" >
                    <el-input v-model="form.typeName" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="成本价" >
                    <el-input v-model="form.costprice"  :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="宠物名" prop="name" >
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="售价" >
                <el-input v-model="form.saleprice"></el-input>
                </el-form-item>
                <el-form-item label="支付类型" >
                    <el-select v-model="form.paytype"  placeholder="请选择活动区域">
                        <el-option label="垫付" value="1" ></el-option>
                        <el-option label="银行转账" value="2"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item prop="logo" label="宠物图片">
                    <el-upload
                            class="upload-demo"
                            action="/api/fastdfs/upload"
                            :on-remove="handleRemove"
                            :on-success="handleSuccess"
                            :file-list="fileList"
                            list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>

                <el-form-item label="宠物介绍">
                    <!-- <el-input v-model="form.intro"></el-input>-->
                    <quill-editor :options="editorOption" v-model="form.intro">
                    </quill-editor>
                </el-form-item>
                <el-form-item label="领养须知">
                    <!--<el-input v-model="form.orderNotice"></el-input>-->
                    <quill-editor :options="editorOption" v-model="form.adoptNotice">
                    </quill-editor>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click="addSubmit" >提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>
<script>
    import { quillEditor } from "vue-quill-editor"; //调用编辑器
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';
    import quillConfig from "../../common/quill-config"
    export default {
        //申明组件
        components: {
            quillEditor//quillEditor:quillEditor
        },
        data() {
            return {
                editorOption: quillConfig,
                fileList:[],
                /*定义校验规则*/
                rules: {
                    name: [
                        {required: true, message: '宠物名必填!!', trigger: 'blur'}
                    ]
                },
                //弹出框标题
                title:"",
                //弹出框默认是关闭状态
                addFormVisible:false,
                //上级部门
                parents:[],
                //高级查询form表单
                searchForm:{
                    //部门名
                    title:"",
                    //状态
                    state:0
                },
                //弹出框form中的属性
                form:{
                    id:"",
                    username:"",//用户名
                    typeName:"",//宠物类型
                    name:"",//宠物名
                    saleprice:"",//售价
                    costprice:"",//成本价
                    intro:"",//宠物介绍
                    adoptNotice:"",//领养须知
                    paytype: ""//支付方式
                },
                //分页列表
                pendingMessages: [],
                //显示加载框
                listLoading: false,
                //当前页
                currentPage: 1,
                //每页条数
                pageSize: 5,
                //总条数
                total: 0
            };
        },
        methods:{
            //先不管，下午说
            handleSuccess(response, file, fileList){
                console.debug(fileList);
                // for(var i=0;i<fileList.length;i++){
                //     if(i==0){
                //         this.form.resources = fileList[i].response.resultObj;
                //     }else{
                //         this.form.resources = this.form.resources+","+ fileList[i].response.resultObj;
                //     }
                // }
            },
            //先不管，下午说
            handleRemove(file, fileList) {
                console.debug(file,fileList);

                // var filePath =file.response.resultObj;
                // this.$http.delete("/common/fastDfs/?path="+filePath)
                //     .then(res=>{
                //         if(res.data.success){
                //             this.$message({
                //                 message: '删除成功!',
                //                 type: 'success'
                //             });
                //         }else{
                //             this.$message({
                //                 message: '删除失败!',
                //                 type: 'error'
                //             });
                //         }
                //     })
            },

            //点击处理框触发函数
            handle(index,row){
                //修改标题
                this.title = "处理寻主信息";
                //console.debug(row);
                //回显用户名
                this.form.username = row.user.username||row.user.phone||row.user.email;
                //回显宠物类型
                this.form.typeName = row.petType.name;
                //回显类型id
                this.form.type_id=row.petType.id;
                //回显宠物名
                this.form.name = row.name;
                //回显shop_id
                this.form.shop_id=row.shop.id;
                //回显userid
                this.form.user_id=row.user.id;
                //回显成本价
                this.form.costprice =row.price;
                //回显searchMasterMsg
                this.form.searchMasterMsgId=row.id;
                //图片回显

                //显示弹出框
                this.addFormVisible = true;
            },
            //页码发生改变的时候触发函数
            handleCurrentChange(val){
                //重新修改页码
                this.currentPage = val;
                //重新加载列表
                this.loadPendingMessages();
            },
            //加载员工分页列表
            loadPendingMessages(){
                //分页传递参数
                let param = {
                    "localPage": this.currentPage,
                    "pageSize": this.pageSize,
                    "title":this.searchForm.title,
                    "state":this.searchForm.state
                };
                //查询待处理寻主信息
                this.$http.post("/searchMasterMsg/queryPendingMessagePage", param).then(res => {
                    //console.debug(res);
                    let {data, totals} = res.data;
                    this.pendingMessages = data;
                    this.total = totals;
                });
            },
            //高级查询按钮
            searchFormMessages(){
                //把页码重新设置到第一页
                this.currentPage = 1;
                //再次进行查询部门
                this.loadPendingMessages();
            },
            //保存/修改都是用此事件
            addSubmit(){
                //console.debug(this.form);
                let detail={
                  "adoptNotice":this.form.adoptNotice,
                    "intro":this.form.intro
                };
                //添加对象
                this.form.detail=detail;
                let petType={"id":this.form.type_id};
                //宠物类型呢对象
                this.form.petType=petType;
                //用户id
                let user ={"id":this.form.user_id};
                this.form.user=user;
                //shop
                let shop={"id":this.form.shop_id};
                this.form.shop=shop;
                //searchMasterMsg 对像
                let searchMasterMsg={"id":this.form.searchMasterMsgId};
                this.form.searchMasterMsg=searchMasterMsg;

                this.$http.put("/pet/handlePet",this.form).then(res=>{
                    //console.debug(res);
                    let {success, msg} = res.data;
                    if (success) {
                        this.$message({
                            type: 'success',
                            message: '处理成功!'
                        });
                        //关闭显示框
                        this.addFormVisible = false;
                        //重新刷新页面
                        this.loadPendingMessages();
                    } else {
                        this.$message.error(msg);
                    }
                })
            }


        },
        mounted(){
            //调用分页列表
            this.loadPendingMessages();
        }
    };
</script>